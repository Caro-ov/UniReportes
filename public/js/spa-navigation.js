/**
 * Sistema de navegación SPA (Single Page Application)
 * Mantiene sidebar y header estáticos, solo cambia el contenido principal
 */

class SPANavigation {
    constructor() {
        this.isInitialized = false;
        this.currentPage = '';
        this.pageCache = new Map();
        this.isLoading = false;
        
        // Configuración de páginas
        this.pageConfig = {
            // Páginas de admin
            'admin-dashboard': {
                url: '/admin-dashboard.html',
                title: 'Panel de Administración',
                css: 'admin-dashboard',
                contentSelector: '.contenido-principal'
            },
            'explorar-reportes': {
                url: '/explorar-reportes.html',
                title: 'Explorar Reportes',
                css: 'explorar-reportes',
                contentSelector: '.contenido-principal'
            },
            'crear-reporte': {
                url: '/crear-reporte.html',
                title: 'Crear Reporte',
                css: 'crear-reporte',
                contentSelector: '.contenido-principal'
            },
            'crear-usuario': {
                url: '/crear-usuario.html',
                title: 'Crear Usuario',
                css: 'crear-usuario',
                contentSelector: '.contenido-principal'
            },
            'admin-settings': {
                url: '/admin-settings.html',
                title: 'Configuración',
                css: 'admin-settings',
                contentSelector: '.contenido-principal'
            },
            'ver-usuarios': {
                url: '/ver-usuarios.html',
                title: 'Ver Usuarios',
                css: 'ver-usuarios',
                contentSelector: '.contenido-principal'
            },
            
            // Páginas de usuario
            'dashboard': {
                url: '/dashboard.html',
                title: 'Dashboard',
                css: 'dashboard',
                contentSelector: '.contenido-principal'
            },
            'mis-reportes': {
                url: '/mis-reportes.html',
                title: 'Mis Reportes',
                css: 'mis-reportes',
                contentSelector: '.contenido-principal'
            },
            'perfil': {
                url: '/perfil.html',
                title: 'Mi Perfil',
                css: 'perfil',
                contentSelector: '.contenido-principal'
            },
            'ayuda': {
                url: '/ayuda.html',
                title: 'Ayuda',
                css: 'ayuda',
                contentSelector: '.contenido-principal'
            },
            'ayuda-partial': {
                url: '/partials/ayuda.html',
                title: 'Ayuda',
                css: 'ayuda',
                contentSelector: '.contenido-principal'
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('Inicializando navegación SPA...');
        
        // Detectar página actual
        this.currentPage = this.detectCurrentPage();
        
        // Interceptar clics en enlaces de navegación
        this.setupNavigationListeners();
        
        // Manejar botón atrás/adelante del navegador
        this.setupHistoryListener();
        
        this.isInitialized = true;
        console.log('Navegación SPA inicializada. Página actual:', this.currentPage);
    }
    
    detectCurrentPage() {
        const path = window.location.pathname;
        
        // Mapear rutas a páginas SPA
        if (path.includes('admin-dashboard.html')) return 'admin-dashboard';
        if (path.includes('explorar-reportes.html')) return 'explorar-reportes';
        if (path.includes('crear-reporte.html')) return 'crear-reporte';
        if (path.includes('crear-usuario.html')) return 'crear-usuario';
        if (path.includes('ver-usuarios.html')) return 'ver-usuarios';
        if (path.includes('admin-settings.html')) return 'admin-settings';
        if (path.includes('dashboard.html')) return 'dashboard';
        if (path.includes('mis-reportes.html')) return 'mis-reportes';
        if (path.includes('perfil.html')) return 'perfil';
        if (path.includes('ayuda.html')) return 'ayuda';
        
        // Por defecto
        return 'dashboard';
    }
    
    setupNavigationListeners() {
        // Interceptar clics en el sidebar
        $(document).on('click', '.sidebar .nav-item', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && this.pageConfig[page]) {
                this.navigateTo(page);
            }
        });
        
        // Interceptar otros enlaces de navegación
        $(document).on('click', '[data-spa-nav]', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('spa-nav');
            if (page && this.pageConfig[page]) {
                this.navigateTo(page);
            }
        });
    }
    
    setupHistoryListener() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });
    }
    
    async navigateTo(page, pushState = true) {
        if (this.isLoading || page === this.currentPage) return;
        
        const config = this.pageConfig[page];
        if (!config) {
            console.error('Página no configurada:', page);
            return;
        }
        
        console.log('🧭 SPA: Navegando a página:', page);
        this.isLoading = true;
        
        try {
            // Mostrar indicador de carga
            this.showLoadingIndicator();
            
            // LIMPIAR estilos problemáticos ANTES de hacer cualquier cosa
            this.cleanupBodyStyles();
            
            // Obtener contenido de la página
            const content = await this.loadPageContent(page);
            
            if (content) {
                console.log('📄 SPA: Contenido cargado para:', page);
                
                // Actualizar contenido principal
                this.updateMainContent(content, config, page);
                
                // Actualizar estado
                this.currentPage = page;
                
                // Actualizar URL y título
                this.updateBrowserState(page, config, pushState);
                
                // Actualizar navegación activa
                this.updateActiveNavigation(page);
                
                // Cargar CSS específico y esperar a que se cargue
                await this.loadPageCSS(config.css);
                
                // Asegurar que los CSS esenciales estén cargados
                this.ensureEssentialCSS();
                
                console.log('🎯 SPA: CSS cargado, contenido actualizado');
            }
            
        } catch (error) {
            console.error('Error al navegar:', error);
            this.showError('Error al cargar la página');
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }
    
    async loadPageContent(page) {
        // Verificar cache
        if (this.pageCache.has(page)) {
            console.log('Cargando desde cache:', page);
            return this.pageCache.get(page);
        }
        
        const config = this.pageConfig[page];
        
        try {
            const response = await fetch(config.url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            
            // Para archivos parciales (en /partials/), usar todo el contenido directamente
            if (config.url.includes('/partials/')) {
                console.log('📄 Cargando archivo partial:', page);
                this.pageCache.set(page, html);
                return html;
            }
            
            // Para páginas completas, extraer el contenido principal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const mainContent = doc.querySelector(config.contentSelector);
            if (!mainContent) {
                throw new Error('Contenido principal no encontrado');
            }
            
            const content = mainContent.innerHTML;
            
            // Guardar en cache
            this.pageCache.set(page, content);
            
            return content;
            
        } catch (error) {
            console.error('Error cargando página:', page, error);
            return null;
        }
    }
    
    updateMainContent(content, config, page) {
        const mainContainer = document.querySelector('.contenido-principal');
        console.log('🎯 Actualizando contenido principal:', {
            contenedor: mainContainer ? 'Encontrado' : 'NO ENCONTRADO',
            contenidoLength: content.length,
            config: config,
            page: page
        });
        
        if (mainContainer) {
            const self = this; // Guardar referencia para usar en callbacks
            // Animación de salida
            $(mainContainer).fadeOut(150, () => {
                // Actualizar contenido
                mainContainer.innerHTML = content;
                
                // Actualizar título del body y página actual
                document.body.setAttribute('data-title', `UniReportes - ${config.title}`);
                document.body.setAttribute('data-page', page);
                document.body.setAttribute('data-css', config.css);
                
                // Limpiar estilos problemáticos del body
                self.cleanupBodyStyles();
                
                console.log('✅ Contenido actualizado, elementos encontrados:', {
                    'tabla-usuarios': $('#tabla-usuarios').length,
                    'buscar-usuarios': $('#buscar-usuarios').length,
                    'btn-refrescar': $('#btn-refrescar').length
                });
                
                // Animación de entrada
                $(mainContainer).fadeIn(200, () => {
                    // Ocultar indicador de carga después de la animación
                    self.hideLoadingIndicator();
                    
                    // Disparar evento de cambio de página DESPUÉS de que todo esté listo
                    console.log('🎯 SPA: Disparando evento para:', page);
                    self.triggerPageChangeEvent(page);
                });
                
                // Scroll al top
                mainContainer.scrollTop = 0;
            });
        } else {
            console.error('❌ No se encontró el contenedor .contenido-principal');
        }
    }
    
    updateBrowserState(page, config, pushState) {
        const url = config.url;
        const title = `UniReportes - ${config.title}`;
        
        // Actualizar título de la página
        document.title = title;
        
        // Actualizar URL si es necesario
        if (pushState && window.location.pathname !== url) {
            history.pushState({ page }, title, url);
        }
    }
    
    updateActiveNavigation(page) {
        // Remover clases activas
        $('.nav-item').removeClass('active');
        
        // Activar navegación correspondiente directamente
        const activeItem = $(`.nav-item[data-page="${page}"]`);
        if (activeItem.length > 0) {
            activeItem.addClass('active');
            console.log('SPA: Elemento de navegación marcado como activo:', page);
        } else {
            console.log('SPA: No se encontró elemento de navegación para:', page);
        }
    }
    
    loadPageCSS(cssName) {
        const cssId = `css-${cssName}`;
        
        console.log('🎨 Cargando CSS:', cssName, 'ID:', cssId);
        
        // Verificar si ya está cargado
        if (document.getElementById(cssId)) {
            console.log('✅ CSS ya estaba cargado:', cssName);
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Crear enlace CSS - Usar ruta ABSOLUTA para evitar problemas con rutas relativas
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = `/css/${cssName}.css`; // Ruta absoluta con / al inicio
            
            // Configurar eventos de carga
            link.onload = () => {
                console.log('✅ CSS cargado exitosamente:', cssName);
                resolve();
            };
            
            link.onerror = () => {
                console.error('❌ Error al cargar CSS:', cssName);
                reject(new Error(`Failed to load CSS: ${cssName}`));
            };
            
            console.log('� Agregando CSS al head:', link.href);
            
            // Agregar al head
            document.head.appendChild(link);
        });
    }
    
    ensureEssentialCSS() {
        // Lista de CSS esenciales que siempre deben estar cargados
        const essentialCSS = ['components'];
        
        essentialCSS.forEach(cssName => {
            const cssId = `css-${cssName}`;
            if (!document.getElementById(cssId)) {
                console.log('📎 Cargando CSS esencial:', cssName);
                const link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.href = `/css/${cssName}.css`;
                document.head.appendChild(link);
            }
        });
    }
    
    showLoadingIndicator() {
        // Agregar clase de carga al body
        document.body.classList.add('spa-loading');
        
        // Mostrar indicador visual si existe
        const loader = document.querySelector('.spa-loader');
        if (loader) {
            loader.style.display = 'block';
        }
    }
    
    hideLoadingIndicator() {
        document.body.classList.remove('spa-loading');
        
        const loader = document.querySelector('.spa-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    showError(message) {
        console.error('SPA Error:', message);
        // Aquí podrías mostrar un toast o modal de error
    }
    
    triggerPageChangeEvent(page) {
        console.log('🚀 SPA: Disparando evento spaPageChange para página:', page);
        
        // Pequeño delay para asegurar que el DOM esté completamente actualizado
        setTimeout(() => {
            const event = new CustomEvent('spaPageChange', {
                detail: { page, config: this.pageConfig[page] }
            });
            document.dispatchEvent(event);
            console.log('✅ SPA: Evento spaPageChange disparado');
            
            // Manejar ver-usuarios específicamente aquí
            if (page === 'ver-usuarios') {
                console.log('🎯 SPA: Manejando ver-usuarios directamente...');
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    this.manejarVerUsuarios();
                }, 200);
            }
        }, 50);
    }
    
    // Función específica para manejar la página de ver-usuarios
    async manejarVerUsuarios() {
        console.log('🚀 SPA: Iniciando manejo directo de ver-usuarios...');
        
        try {
            // Esperar a que el contenido esté completamente cargado
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const verificarElementos = () => {
                        const tabla = document.getElementById('tabla-usuarios');
                        const loading = document.getElementById('loading-usuarios');
                        const tbody = document.getElementById('tbody-usuarios');
                        
                        if (tabla && loading && tbody) {
                            console.log('✅ SPA: Elementos encontrados, procediendo con inicialización');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando elementos...');
                            setTimeout(verificarElementos, 50);
                        }
                    };
                    verificarElementos();
                });
            };
            
            await esperarContenido();
            
            // Configurar eventos para la funcionalidad
            setTimeout(() => {
                this.configurarEventosVerUsuarios();
            }, 100);
            
        } catch (error) {
            console.error('💥 SPA: Error en manejarVerUsuarios:', error);
        }
    }
    
    configurarEventosVerUsuarios() {
        console.log('🔧 SPA: Configurando eventos para Ver Usuarios...');
        
        try {
            // Verificar si VerUsuarios está disponible
            if (typeof window.VerUsuarios === 'undefined') {
                console.log('📦 SPA: VerUsuarios no está cargado, cargando script...');
                
                // Verificar si el script ya existe
                const scriptExistente = document.querySelector('script[src*="ver-usuarios.js"]');
                if (scriptExistente) {
                    console.log('📜 SPA: Script ver-usuarios.js ya existe, esperando carga...');
                    // Esperar un momento para que se cargue
                    setTimeout(() => {
                        this.inicializarVerUsuarios();
                    }, 200);
                    return;
                }
                
                // Cargar el script de ver-usuarios
                const script = document.createElement('script');
                script.src = '/js/ver-usuarios.js';
                script.async = false; // Cargar síncronamente para evitar problemas de timing
                
                script.onload = () => {
                    console.log('✅ SPA: Script ver-usuarios.js cargado exitosamente');
                    setTimeout(() => {
                        this.inicializarVerUsuarios();
                    }, 100);
                };
                
                script.onerror = () => {
                    console.error('❌ SPA: Error cargando script ver-usuarios.js');
                    // Intentar usando jQuery si está disponible
                    if (typeof $ !== 'undefined') {
                        $.getScript('/js/ver-usuarios.js')
                            .done(() => {
                                console.log('✅ SPA: Script cargado via jQuery');
                                setTimeout(() => {
                                    this.inicializarVerUsuarios();
                                }, 100);
                            })
                            .fail(() => {
                                console.error('❌ SPA: Error cargando script via jQuery');
                            });
                    }
                };
                
                document.head.appendChild(script);
            } else {
                console.log('✅ SPA: VerUsuarios ya está disponible');
                this.inicializarVerUsuarios();
            }
        } catch (error) {
            console.error('❌ SPA: Error configurando eventos Ver Usuarios:', error);
        }
    }
    
    inicializarVerUsuarios() {
        console.log('🎯 SPA: Inicializando módulo Ver Usuarios...');
        
        try {
            // Verificar que los elementos estén presentes antes de inicializar
            const elementosNecesarios = [
                'tabla-usuarios',
                'loading-usuarios', 
                'tbody-usuarios',
                'buscar-usuarios',
                'filtro-rol'
            ];
            
            const elementosEncontrados = elementosNecesarios.every(id => {
                const elemento = document.getElementById(id);
                console.log(`🔍 SPA: Elemento ${id}:`, !!elemento);
                return !!elemento;
            });
            
            if (!elementosEncontrados) {
                console.warn('⚠️ SPA: No todos los elementos necesarios están presentes, reintentando...');
                setTimeout(() => {
                    this.inicializarVerUsuarios();
                }, 200);
                return;
            }
            
            if (window.VerUsuarios && typeof window.VerUsuarios.init === 'function') {
                console.log('🚀 SPA: Llamando VerUsuarios.init()...');
                
                // Asegurar que cualquier inicialización previa se limpie
                if (typeof window.VerUsuarios.cleanup === 'function') {
                    console.log('🧹 SPA: Limpiando inicialización previa...');
                    window.VerUsuarios.cleanup();
                }
                
                const result = window.VerUsuarios.init();
                
                if (result) {
                    console.log('✅ SPA: VerUsuarios inicializado exitosamente');
                    
                    // Verificar que los eventos se hayan configurado correctamente
                    setTimeout(() => {
                        const botones = document.querySelectorAll('.btn-accion');
                        console.log(`🔍 SPA: Botones de acción encontrados: ${botones.length}`);
                        
                        if (botones.length > 0) {
                            console.log('✅ SPA: Botones de acción están presentes');
                        } else {
                            console.warn('⚠️ SPA: No se encontraron botones de acción');
                        }
                    }, 500);
                    
                } else {
                    console.warn('⚠️ SPA: VerUsuarios.init() retornó false, reintentando...');
                    setTimeout(() => {
                        this.inicializarVerUsuarios();
                    }, 300);
                }
            } else {
                console.error('❌ SPA: VerUsuarios.init no está disponible');
            }
        } catch (error) {
            console.error('❌ SPA: Error inicializando VerUsuarios:', error);
            // Reintentar una vez en caso de error
            setTimeout(() => {
                this.inicializarVerUsuarios();
            }, 500);
        }
    }
    
    // Método público para navegación programática
    static navigateTo(page) {
        if (window.spaNav) {
            window.spaNav.navigateTo(page);
        }
    }
    
    // Método para limpiar cache
    clearCache() {
        this.pageCache.clear();
        console.log('Cache de páginas limpiado');
    }
    
    // Función para limpiar estilos problemáticos del body
    cleanupBodyStyles() {
        console.log('🧹 Limpiando estilos problemáticos del body...');
        
        // Forzar estilos correctos en el body para evitar espacios verdes
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Asegurar que no haya espacios extraños
        const html = document.documentElement;
        html.style.backgroundColor = '#FFFFFF';
        html.style.margin = '0';
        html.style.padding = '0';
        
        // Eliminar cualquier clase que pueda estar causando problemas
        document.body.classList.remove('spa-loading');
        
        console.log('✅ Estilos del body limpiados');
    }
}

// Inicializar cuando el DOM esté listo Y los componentes estén cargados
$(document).ready(() => {
    // Solo inicializar en páginas que tienen la estructura SPA
    if (document.querySelector('.contenedor-principal')) {
        // Esperar a que el sidebar esté cargado antes de inicializar SPA
        $(document).on('sidebarLoaded', function() {
            if (!window.spaNav) {
                console.log('Inicializando SPA después de cargar sidebar...');
                window.spaNav = new SPANavigation();
            }
        });
        
        // Timeout de seguridad en caso de que el evento no se dispare
        setTimeout(() => {
            if (!window.spaNav) {
                console.log('Inicializando SPA por timeout de seguridad...');
                window.spaNav = new SPANavigation();
            }
        }, 2000);
    }
});

// Exportar para uso global
window.SPANavigation = SPANavigation;