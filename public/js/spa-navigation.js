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
            'detalle-reporte': {
                url: '/detalle-reporte.html',
                title: 'Detalle del Reporte',
                css: 'detalle-reporte',
                contentSelector: '.contenido-principal'
            },
            'detalle-reporte-admin': {
                url: '/detalle-reporte-admin.html',
                title: 'Detalle del Reporte (Admin)',
                css: 'detalle-reporte',
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
    if (path.includes('detalle-reporte.html')) return 'detalle-reporte';
    if (path.includes('detalle-reporte-admin.html')) return 'detalle-reporte-admin';
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
    
    async navigateTo(page, paramsOrPushState = true, pushState = true) {
        // Manejar diferentes tipos de llamadas
        let urlParams = '';
        let shouldPushState = true;
        
        if (typeof paramsOrPushState === 'string') {
            // Llamada con parámetros: navigateTo('page', '?id=123', true/false)
            urlParams = paramsOrPushState;
            shouldPushState = pushState;
        } else if (typeof paramsOrPushState === 'boolean') {
            // Llamada tradicional: navigateTo('page', true/false)
            shouldPushState = paramsOrPushState;
        }
        
        if (this.isLoading || page === this.currentPage) return;
        
        const config = this.pageConfig[page];
        if (!config) {
            console.error('Página no configurada:', page);
            return;
        }
        
        console.log('🧭 SPA: Navegando a página:', page, 'con parámetros:', urlParams);
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
                
                // Cargar CSS específico ANTES de actualizar contenido para evitar flash
                await this.loadPageCSS(config.css);
                
                // Asegurar que los CSS esenciales estén cargados
                this.ensureEssentialCSS();
                
                // Actualizar contenido principal
                this.updateMainContent(content, config, page);
                
                // Actualizar estado
                this.currentPage = page;
                
                // Actualizar URL y título
                this.updateBrowserState(page, config, shouldPushState, urlParams);
                
                // Actualizar navegación activa
                this.updateActiveNavigation(page);
                
                // Disparar evento de cambio de página con parámetros
                this.triggerPageChangeEvent(page, urlParams);
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
    
    updateBrowserState(page, config, pushState, urlParams = '') {
        const baseUrl = config.url;
        const fullUrl = baseUrl + urlParams;
        const title = `UniReportes - ${config.title}`;
        
        // Actualizar título de la página
        document.title = title;
        
        // Actualizar URL si es necesario
        if (pushState && window.location.pathname + window.location.search !== fullUrl) {
            history.pushState({ page, params: urlParams }, title, fullUrl);
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
    
    triggerPageChangeEvent(page, urlParams = '') {
        console.log('🚀 SPA: Disparando evento spaPageChange para página:', page, 'con parámetros:', urlParams);
        
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
            
            // Manejar crear-usuario específicamente aquí
            if (page === 'crear-usuario') {
                console.log('🎯 SPA: Manejando crear-usuario directamente...');
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    this.manejarCrearUsuario();
                }, 200);
            }
            
            // Manejar crear-reporte específicamente aquí
            if (page === 'crear-reporte') {
                console.log('🎯 SPA: Manejando crear-reporte directamente...');
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    this.manejarCrearReporte();
                }, 200);
            }
            
            // Manejar explorar-reportes específicamente aquí
            if (page === 'explorar-reportes') {
                console.log('🎯 SPA: Manejando explorar-reportes directamente...');
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    this.manejarExplorarReportes();
                }, 200);
            }
            
            // Manejar mis-reportes específicamente aquí
            if (page === 'mis-reportes') {
                console.log('🎯 SPA: Manejando mis-reportes directamente...');
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    this.manejarMisReportes();
                }, 200);
            }
            
            // Manejar detalle-reporte (estándar y admin) específicamente aquí
            if (page === 'detalle-reporte' || page === 'detalle-reporte-admin') {
                console.log('🎯 SPA: Manejando detalle-reporte directamente...', page);
                // Dar más tiempo para que el DOM se estabilice
                setTimeout(() => {
                    // Usar parámetros pasados o los de la URL actual
                    const params = urlParams || window.location.search;
                    // Si es la vista admin, invocar el handler admin si existe
                    if (page === 'detalle-reporte-admin') {
                        if (typeof window.manejarDetalleReporteAdmin === 'function') {
                            try { window.manejarDetalleReporteAdmin(params); }
                            catch (err) { console.warn('Error al invocar manejarDetalleReporteAdmin', err); }
                        } else {
                            // Intentar cargar el script admin si el handler no está disponible
                            console.log('📦 SPA: manejarDetalleReporteAdmin no encontrado, cargando script admin...');
                            this.cargarScriptDetalleReporteAdmin(params);
                        }
                    } else if (typeof window.manejarDetalleReporte === 'function') {
                        try {
                            // Si params es una query string, extraer el id antes de invocar el handler
                            let reportIdToPass = params;
                            try {
                                if (typeof params === 'string' && params.includes('id=')) {
                                    const tmp = new URLSearchParams(params.startsWith('?') ? params : ('?' + params));
                                    const extracted = tmp.get('id');
                                    if (extracted) reportIdToPass = extracted;
                                }
                            } catch (e) {
                                console.warn('No se pudo parsear params para detalle-reporte:', e);
                            }
                            window.manejarDetalleReporte(reportIdToPass);
                        } catch (err) { console.warn('Error al invocar manejarDetalleReporte', err); }
                    } else {
                        // Si no existe el handler global, delegar al método interno de SPA
                        // que se encargará de cargar el script correspondiente (detalle-reporte.js)
                        try {
                            console.log('📦 SPA: manejarDetalleReporte no encontrado globalmente, delegando a this.manejarDetalleReporte()');
                            this.manejarDetalleReporte(params);
                        } catch (err) {
                            console.warn('No se encontró un handler de detalle-reporte compatible y no se pudo delegar a SPA:', err);
                        }
                    }
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
    
    // Función específica para manejar la página de crear-usuario
    async manejarCrearUsuario() {
        console.log('🚀 SPA: Iniciando manejo directo de crear-usuario...');
        
        try {
            // Esperar a que el DOM esté disponible
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const checkearDOM = () => {
                        const formulario = document.getElementById('formulario-usuario');
                        const nombre = document.getElementById('nombre');
                        const rol = document.getElementById('rol');
                        
                        if (formulario && nombre && rol) {
                            console.log('✅ SPA: DOM de crear-usuario está listo');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando DOM de crear-usuario...');
                            setTimeout(checkearDOM, 50);
                        }
                    };
                    checkearDOM();
                });
            };
            
            await esperarContenido();
            
            // Configurar eventos para la funcionalidad
            setTimeout(() => {
                this.configurarEventosCrearUsuario();
            }, 100);
            
        } catch (error) {
            console.error('💥 SPA: Error en manejarCrearUsuario:', error);
        }
    }

    configurarEventosCrearUsuario() {
        console.log('🔧 SPA: Configurando eventos para Crear Usuario...');
        
        try {
            // Verificar si CrearUsuario está disponible
            if (typeof window.CrearUsuario === 'undefined') {
                console.log('📦 SPA: CrearUsuario no está cargado, cargando script...');
                
                // Verificar si el script ya existe
                const scriptExistente = document.querySelector('script[src*="crear-usuario.js"]');
                if (scriptExistente) {
                    console.log('📜 SPA: Script crear-usuario.js ya existe, esperando carga...');
                    // Esperar un momento para que se cargue
                    setTimeout(() => {
                        this.inicializarCrearUsuario();
                    }, 200);
                    return;
                }
                
                // Cargar el script de crear-usuario
                const script = document.createElement('script');
                script.src = '/js/crear-usuario.js';
                script.async = false; // Cargar síncronamente para evitar problemas de timing
                
                script.onload = () => {
                    console.log('✅ SPA: Script crear-usuario.js cargado exitosamente');
                    setTimeout(() => {
                        this.inicializarCrearUsuario();
                    }, 100);
                };
                
                script.onerror = () => {
                    console.error('❌ SPA: Error cargando script crear-usuario.js');
                    // Intentar usando jQuery si está disponible
                    if (typeof $ !== 'undefined') {
                        $.getScript('/js/crear-usuario.js')
                            .done(() => {
                                console.log('✅ SPA: Script crear-usuario.js cargado con jQuery');
                                setTimeout(() => {
                                    this.inicializarCrearUsuario();
                                }, 100);
                            })
                            .fail(() => {
                                console.error('❌ SPA: Error cargando crear-usuario.js con jQuery');
                            });
                    }
                };
                
                document.head.appendChild(script);
                
            } else {
                console.log('✅ SPA: CrearUsuario ya está disponible');
                this.inicializarCrearUsuario();
            }
            
        } catch (error) {
            console.error('💥 SPA: Error en configurarEventosCrearUsuario:', error);
        }
    }
    
    inicializarCrearUsuario() {
        console.log('🎬 SPA: Inicializando CrearUsuario...');
        
        try {
            // Verificar que todos los elementos necesarios estén presentes
            const elementosRequeridos = [
                '#formulario-usuario',
                '#nombre',
                '#email',
                '#rol',
                '#btn-cancelar'
            ];
            
            let elementosEncontrados = true;
            elementosRequeridos.forEach(selector => {
                const elemento = document.querySelector(selector);
                if (!elemento) {
                    console.warn(`⚠️ SPA: Elemento ${selector} no encontrado`);
                    elementosEncontrados = false;
                }
            });
            
            if (!elementosEncontrados) {
                console.warn('⚠️ SPA: No todos los elementos necesarios están presentes, reintentando...');
                setTimeout(() => {
                    this.inicializarCrearUsuario();
                }, 200);
                return;
            }
            
            if (window.CrearUsuario && typeof window.CrearUsuario.init === 'function') {
                console.log('🚀 SPA: Llamando CrearUsuario.init()...');
                
                // Asegurar que cualquier inicialización previa se limpie
                if (typeof window.CrearUsuario.cleanup === 'function') {
                    console.log('🧹 SPA: Limpiando inicialización previa...');
                    window.CrearUsuario.cleanup();
                }
                
                const result = window.CrearUsuario.init();
                
                if (result !== false) {
                    console.log('✅ SPA: CrearUsuario inicializado exitosamente');
                } else {
                    console.warn('⚠️ SPA: CrearUsuario.init() retornó false, reintentando...');
                    setTimeout(() => {
                        this.inicializarCrearUsuario();
                    }, 300);
                }
                
            } else {
                console.error('❌ SPA: window.CrearUsuario.init no está disponible');
                setTimeout(() => {
                    this.inicializarCrearUsuario();
                }, 500);
            }
            
        } catch (error) {
            console.error('💥 SPA: Error en inicializarCrearUsuario:', error);
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
    
    // Función específica para manejar la página de crear-reporte
    async manejarCrearReporte() {
        console.log('🚀 SPA: Iniciando manejo directo de crear-reporte...');
        
        try {
            // Esperar a que el DOM esté disponible
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const checkearDOM = () => {
                        const categoria = document.getElementById('categoria');
                        const objeto = document.getElementById('objeto');
                        const titulo = document.getElementById('titulo');
                        
                        if (categoria && objeto && titulo) {
                            console.log('✅ SPA: DOM de crear-reporte está listo');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando DOM de crear-reporte...');
                            setTimeout(checkearDOM, 50);
                        }
                    };
                    checkearDOM();
                });
            };
            
            await esperarContenido();
            
            // Cargar el script específico de crear-reporte
            setTimeout(() => {
                this.configurarEventosCrearReporte();
            }, 100);
            
        } catch (error) {
            console.error('💥 SPA: Error en manejarCrearReporte:', error);
        }
    }
    
    configurarEventosCrearReporte() {
        console.log('🔧 SPA: Configurando eventos para Crear Reporte...');
        
        try {
            // Verificar si el script de crear-reporte ya está cargado
            const scriptExistente = document.querySelector('script[src*="crear-reporte.js"]');
            if (scriptExistente) {
                console.log('📜 SPA: Script crear-reporte.js ya existe, reinicializando...');
                this.inicializarCrearReporte();
                return;
            }
            
            // Cargar el script de crear-reporte
            console.log('📦 SPA: Cargando script crear-reporte.js...');
            const script = document.createElement('script');
            script.src = '/js/crear-reporte.js';
            script.async = false;
            
            script.onload = () => {
                console.log('✅ SPA: Script crear-reporte.js cargado exitosamente');
                setTimeout(() => {
                    this.inicializarCrearReporte();
                }, 100);
            };
            
            script.onerror = () => {
                console.error('❌ SPA: Error cargando script crear-reporte.js');
                // Intentar con jQuery
                if (typeof $ !== 'undefined') {
                    $.getScript('/js/crear-reporte.js')
                        .done(() => {
                            console.log('✅ SPA: Script crear-reporte.js cargado con jQuery');
                            setTimeout(() => {
                                this.inicializarCrearReporte();
                            }, 100);
                        })
                        .fail(() => {
                            console.error('❌ SPA: Error cargando crear-reporte.js con jQuery');
                        });
                }
            };
            
            document.head.appendChild(script);
            
        } catch (error) {
            console.error('💥 SPA: Error en configurarEventosCrearReporte:', error);
        }
    }
    
    inicializarCrearReporte() {
        console.log('🎬 SPA: Inicializando CrearReporte...');
        
        try {
            // Verificar que jQuery esté disponible
            if (typeof $ === 'undefined') {
                console.error('❌ SPA: jQuery no está disponible para CrearReporte');
                return;
            }
            
            // Si la función global está disponible, usarla
            if (typeof window.inicializarCrearReporte === 'function') {
                console.log('✅ SPA: Usando función inicializarCrearReporte global');
                window.inicializarCrearReporte();
                return;
            }
            
            // Si no está disponible, cargar categorías y ubicaciones directamente
            console.log('📦 SPA: Función global no disponible, cargando datos directamente...');
            this.cargarCategoriasDirecta();
            this.cargarUbicacionesDirecta();
            this.configurarEventosFormulario();
            
        } catch (error) {
            console.error('💥 SPA: Error en inicializarCrearReporte:', error);
        }
    }
    
    async cargarCategoriasDirecta() {
        console.log('🔄 SPA: Cargando categorías directamente...');
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (res.ok && json.success) {
                const categorias = json.data || [];
                const $sel = $('#categoria');
                $sel.html('<option disabled selected value="">Selecciona una categoría...</option>');
                categorias.forEach(cat => {
                    $sel.append(`<option value="${cat.id_categoria}">${cat.nombre}</option>`);
                });
                console.log('✅ SPA: Categorías cargadas exitosamente');
                
                // Configurar evento de cambio para cargar objetos
                $sel.off('change.spa').on('change.spa', (e) => {
                    const categoriaId = e.target.value;
                    if (categoriaId) {
                        this.cargarObjetosDirecta(categoriaId);
                    }
                });
            } else {
                console.error('❌ SPA: Error al cargar categorías', json);
            }
        } catch (err) {
            console.error('❌ SPA: Error cargando categorías', err);
        }
    }
    
    async cargarObjetosDirecta(categoriaId) {
        console.log('🔄 SPA: Cargando objetos para categoría:', categoriaId);
        const $sel = $('#objeto');
        $sel.prop('disabled', true).html('<option>Cargando...</option>');
        try {
            const res = await fetch(`/api/objects/categoria/${categoriaId}`);
            const json = await res.json();
            if (res.ok && json.success) {
                const objetos = json.data || [];
                if (objetos.length === 0) {
                    $sel.html('<option disabled selected value="">No hay objetos para esta categoría</option>');
                    $sel.prop('disabled', true);
                } else {
                    $sel.html('<option disabled selected value="">Selecciona un objeto (opcional)</option>');
                    objetos.forEach(o => $sel.append(`<option value="${o.id_objeto}">${o.nombre}</option>`));
                    $sel.prop('disabled', false);
                }
            } else {
                console.error('❌ SPA: Error al cargar objetos', json);
                $sel.html('<option disabled selected value="">Error al cargar objetos</option>');
                $sel.prop('disabled', true);
            }
        } catch (err) {
            console.error('❌ SPA: Error cargando objetos', err);
            $sel.html('<option disabled selected value="">Error al conectar</option>');
            $sel.prop('disabled', true);
        }
    }
    
    async cargarUbicacionesDirecta() {
        console.log('� SPA: Cargando ubicaciones directamente...');
        try {
            const res = await fetch('/api/ubicaciones');
            const json = await res.json();
            if (res.ok && json.success) {
                const ubicaciones = json.data || [];
                const $sel = $('#ubicacion');
                $sel.html('<option disabled selected value="">Selecciona una ubicación...</option>');
                ubicaciones.forEach(ubicacion => {
                    $sel.append(`<option value="${ubicacion.id_ubicacion}">${ubicacion.nombre}</option>`);
                });
                console.log('✅ SPA: Ubicaciones cargadas exitosamente');
                
                // Configurar evento de cambio para cargar salones
                $sel.off('change.spa').on('change.spa', (e) => {
                    const idUbicacion = e.target.value;
                    if (idUbicacion) {
                        this.cargarSalonesDirecta(idUbicacion);
                    }
                });
            } else {
                console.error('❌ SPA: Error al cargar ubicaciones', json);
            }
        } catch (err) {
            console.error('❌ SPA: Error cargando ubicaciones', err);
        }
    }

    async cargarSalonesDirecta(idUbicacion) {
        console.log('🔄 SPA: Cargando salones para ubicación ID:', idUbicacion);
        const $salon = $('#salon');
        $salon.prop('disabled', true).html('<option>Cargando salones...</option>');
        
        try {
            const res = await fetch(`/api/ubicaciones/${idUbicacion}/salones`);
            const json = await res.json();
            if (res.ok && json.success) {
                const salones = json.data || [];
                if (salones.length === 0) {
                    $salon.html('<option disabled selected value="">No hay salones registrados para esta ubicación</option>');
                    $salon.prop('disabled', true);
                } else {
                    $salon.html('<option disabled selected value="">Selecciona un salón...</option>');
                    salones.forEach(salon => {
                        $salon.append(`<option value="${salon.id_salon}">${salon.nombre}</option>`);
                    });
                    $salon.prop('disabled', false);
                }
            } else {
                console.error('❌ SPA: Error al cargar salones', json);
                $salon.html('<option disabled selected value="">Error al cargar salones</option>');
                $salon.prop('disabled', true);
            }
        } catch (err) {
            console.error('❌ SPA: Error cargando salones', err);
            $salon.html('<option disabled selected value="">Error al conectar</option>');
            $salon.prop('disabled', true);
        }
    }
    
    configurarEventosFormulario() {
        console.log('🔧 SPA: Configurando eventos del formulario...');
        
        // Los eventos de cambio ya se configuran en las funciones de carga
        // Aquí se pueden agregar otros eventos si es necesario
        console.log('✅ SPA: Eventos del formulario configurados');
    }
    
    // Función específica para manejar la página de explorar-reportes
    async manejarExplorarReportes() {
        console.log('🚀 SPA: Iniciando manejo directo de explorar-reportes...');
        
        try {
            // Esperar a que el DOM esté disponible
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const checkearDOM = () => {
                        const tabla = document.getElementById('tabla-reportes-body');
                        const filtros = document.querySelector('.filtro-buscar');
                        
                        if (tabla && filtros) {
                            console.log('✅ SPA: DOM de explorar-reportes está listo');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando DOM de explorar-reportes...');
                            setTimeout(checkearDOM, 50);
                        }
                    };
                    checkearDOM();
                });
            };
            
            await esperarContenido();
            
            console.log('🔄 SPA: Llamando cargarReportes desde ExplorarReportes...');
            
            // Intentar ejecutar la función cargarReportes directamente
            setTimeout(() => {
                try {
                    // Si la función está disponible globalmente
                    if (typeof cargarReportes === 'function') {
                        console.log('📞 SPA: Ejecutando cargarReportes directamente');
                        cargarReportes();
                    }
                    else if (window.recargarReportes) {
                        console.log('📞 SPA: Ejecutando window.recargarReportes()');
                        window.recargarReportes();
                    } 
                    // Si la función está en el contexto de ExplorarReportes
                    else if (window.ExplorarReportes && window.ExplorarReportes.cargarReportes) {
                        console.log('📞 SPA: Ejecutando ExplorarReportes.cargarReportes()');
                        window.ExplorarReportes.cargarReportes();
                    }
                    // Fallback: cargar el script y ejecutar
                    else {
                        console.log('📦 SPA: Cargando script explorar-reportes.js...');
                        this.cargarScriptExplorarReportes();
                    }
                } catch (error) {
                    console.error('❌ SPA: Error ejecutando cargarReportes:', error);
                }
            }, 100);
            
        } catch (error) {
            console.error('💥 SPA: Error en manejarExplorarReportes:', error);
        }
    }
    
    cargarScriptExplorarReportes() {
        console.log('📦 SPA: Cargando script explorar-reportes.js...');
        
        // Verificar si el script ya está cargado
        const scriptExistente = document.querySelector('script[src*="explorar-reportes.js"]');
        if (scriptExistente) {
            console.log('📜 SPA: Script explorar-reportes.js ya existe, reejecutando...');
            // Forzar recarga de reportes
            setTimeout(() => {
                if (window.recargarReportes) {
                    window.recargarReportes();
                }
            }, 100);
            return;
        }
        
        const script = document.createElement('script');
        script.src = '/js/explorar-reportes.js';
        script.async = false;
        
        script.onload = () => {
            console.log('✅ SPA: Script explorar-reportes.js cargado exitosamente');
            // El script se ejecutará automáticamente y llamará cargarReportes()
        };
        
        script.onerror = () => {
            console.error('❌ SPA: Error cargando script explorar-reportes.js');
        };
        
        document.head.appendChild(script);
    }
    
    // Función específica para manejar la página de mis-reportes
    async manejarMisReportes() {
        console.log('🚀 SPA: Iniciando manejo directo de mis-reportes...');
        
        try {
            // Esperar a que el contenido esté completamente cargado
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const verificarElementos = () => {
                        const tabla = document.getElementById('tabla-reportes');
                        const tarjetas = document.querySelectorAll('.card-stats');
                        const filtros = document.getElementById('filtro-estado');
                        
                        if (tabla && tarjetas.length > 0) {
                            console.log('✅ SPA: Elementos de mis-reportes encontrados, procediendo con inicialización');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando elementos de mis-reportes...');
                            setTimeout(verificarElementos, 50);
                        }
                    };
                    verificarElementos();
                });
            };
            
            await esperarContenido();
            
            // Llamar a la función de manejo específica de mis-reportes
            setTimeout(() => {
                if (window.manejarMisReportes) {
                    console.log('📞 SPA: Ejecutando window.manejarMisReportes()');
                    window.manejarMisReportes();
                } else {
                    console.log('❌ SPA: Función manejarMisReportes no encontrada, cargando script...');
                    this.cargarScriptMisReportes();
                }
            }, 100);
            
        } catch (error) {
            console.error('💥 SPA: Error en manejarMisReportes:', error);
        }
    }
    
    cargarScriptMisReportes() {
        console.log('📦 SPA: Cargando script mis-reportes.js...');
        
        // Verificar si el script ya está cargado
        const scriptExistente = document.querySelector('script[src*="mis-reportes.js"]');
        if (scriptExistente) {
            console.log('📜 SPA: Script mis-reportes.js ya existe, reejecutando...');
            if (window.manejarMisReportes) {
                window.manejarMisReportes();
            }
            return;
        }
        
        // Crear y cargar el script
        const script = document.createElement('script');
        script.src = '/js/mis-reportes.js';
        script.onload = () => {
            console.log('✅ SPA: Script mis-reportes.js cargado exitosamente');
            // Ejecutar la función después de cargar
            setTimeout(() => {
                if (window.manejarMisReportes) {
                    console.log('📞 SPA: Ejecutando window.manejarMisReportes() después de cargar script');
                    window.manejarMisReportes();
                } else {
                    console.error('❌ SPA: Función manejarMisReportes no disponible después de cargar script');
                }
            }, 100);
        };
        script.onerror = () => {
            console.error('❌ SPA: Error cargando script mis-reportes.js');
        };
        
        document.head.appendChild(script);
    }

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
        
        // Limpiar modales residuales
        $('#modal-eliminar').remove();
        $('.modal-overlay').remove();
        
        console.log('✅ Estilos del body limpiados');
    }
    
    // Función específica para manejar la página de detalle-reporte
    async manejarDetalleReporte(params = '') {
        console.log('🚀 SPA: Iniciando manejo directo de detalle-reporte...', params);
        
        try {
            // Extraer el ID del reporte de los parámetros
            const urlParams = new URLSearchParams(params);
            const reportId = urlParams.get('id');
            
            if (!reportId) {
                console.error('❌ No se encontró ID del reporte en los parámetros');
                return;
            }
            
            console.log('📋 ID del reporte:', reportId);
            
            // Esperar a que el contenido esté completamente cargado
            const esperarContenido = () => {
                return new Promise((resolve) => {
                    const verificarElementos = () => {
                        const contenidoPrincipal = document.querySelector('.contenido-principal');
                        if (contenidoPrincipal) {
                            console.log('✅ SPA: Elementos de detalle-reporte encontrados, procediendo con inicialización');
                            resolve();
                        } else {
                            console.log('⏳ SPA: Esperando elementos de detalle-reporte...');
                            setTimeout(verificarElementos, 100);
                        }
                    };
                    verificarElementos();
                });
            };
            
            await esperarContenido();
            
            // Llamar a la función de manejo específica de detalle-reporte
            if (window.manejarDetalleReporte) {
                console.log('📞 SPA: Ejecutando window.manejarDetalleReporte()');
                window.manejarDetalleReporte(reportId);
            } else {
                console.log('❌ SPA: Función manejarDetalleReporte no encontrada, cargando script...');
                await this.cargarScriptDetalleReporte(reportId);
            }
        } catch (error) {
            console.error('💥 SPA: Error en manejarDetalleReporte:', error);
        }
    }
    
    // Función para cargar el script de detalle-reporte
    async cargarScriptDetalleReporte(reportId) {
        console.log('📦 SPA: Cargando script detalle-reporte.js...');
        
        // Verificar si el script ya existe
        const scriptExistente = document.querySelector('script[src*="detalle-reporte.js"]');
        if (scriptExistente && window.manejarDetalleReporte) {
            console.log('📜 SPA: Script detalle-reporte.js ya existe, reejecutando...');
            if (window.manejarDetalleReporte) {
                window.manejarDetalleReporte(reportId);
            }
            return;
        }
        
        // Crear y cargar el script
        const script = document.createElement('script');
        script.src = '/js/detalle-reporte.js';
        script.onload = () => {
            console.log('✅ SPA: Script detalle-reporte.js cargado exitosamente');
            // Ejecutar la función después de cargar
            setTimeout(() => {
                if (window.manejarDetalleReporte) {
                    console.log('📞 SPA: Ejecutando window.manejarDetalleReporte() después de cargar script');
                    window.manejarDetalleReporte(reportId);
                } else {
                    console.error('❌ SPA: Función manejarDetalleReporte no disponible después de cargar script');
                }
            }, 100);
        };
        script.onerror = () => {
            console.error('❌ SPA: Error cargando script detalle-reporte.js');
        };
        
        document.head.appendChild(script);
    }

    // Función para cargar el script de detalle-reporte-admin (admin)
    async cargarScriptDetalleReporteAdmin(params = '') {
        console.log('📦 SPA: Cargando script detalle-reporte-admin.js...');

        // Extraer posible reportId de params
        let reportId = null;
        try {
            const urlParams = new URLSearchParams(params);
            reportId = urlParams.get('id');
        } catch (e) {
            // params podría ser algo distinto; intentar parsear como search
            try {
                const p = params && params.indexOf('?') === 0 ? params : ('?' + params);
                const urlParams2 = new URLSearchParams(p);
                reportId = urlParams2.get('id');
            } catch (err) {
                console.warn('No se pudo extraer id de params en cargarScriptDetalleReporteAdmin', err);
            }
        }

        // Verificar si el script ya existe
        const scriptExistente = document.querySelector('script[src*="detalle-reporte-admin.js"]');
        if (scriptExistente && typeof window.manejarDetalleReporteAdmin === 'function') {
            console.log('📜 SPA: Script detalle-reporte-admin.js ya existe, reejecutando handler...');
            if (window.manejarDetalleReporteAdmin) {
                window.manejarDetalleReporteAdmin(params || reportId);
            }
            return;
        }

        // Asegurar que las utilidades comunes estén cargadas antes del script admin
        const commonScript = document.querySelector('script[src*="detalle-reporte-common.js"]');
        const loadAdmin = () => {
            const script = document.createElement('script');
            script.src = '/js/detalle-reporte-admin.js';
            script.async = false;

            script.onload = () => {
                console.log('✅ SPA: Script detalle-reporte-admin.js cargado exitosamente');
                // Ejecutar la función después de cargar
                setTimeout(() => {
                    if (typeof window.manejarDetalleReporteAdmin === 'function') {
                        try { window.manejarDetalleReporteAdmin(params || reportId); }
                        catch (err) { console.warn('Error al ejecutar manejarDetalleReporteAdmin después de cargar script', err); }
                    } else {
                        console.error('❌ SPA: manejarDetalleReporteAdmin no disponible después de cargar script');
                    }
                }, 100);
            };

            script.onerror = () => {
                console.error('❌ SPA: Error cargando script detalle-reporte-admin.js');
            };

            document.head.appendChild(script);
        };

        if (!commonScript) {
            console.log('📦 SPA: detalle-reporte-common.js no está presente, cargándolo antes del admin...');
            const sCommon = document.createElement('script');
            sCommon.src = '/js/detalle-reporte-common.js';
            sCommon.async = false;
            sCommon.onload = () => {
                console.log('✅ SPA: Script detalle-reporte-common.js cargado');
                loadAdmin();
            };
            sCommon.onerror = () => {
                console.error('❌ SPA: Error cargando detalle-reporte-common.js');
                // Intentar cargar admin de todas formas
                loadAdmin();
            };
            document.head.appendChild(sCommon);
        } else {
            loadAdmin();
        }
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