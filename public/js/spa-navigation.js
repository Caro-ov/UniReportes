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
        
        console.log('Navegando a:', page);
        this.isLoading = true;
        
        try {
            // Mostrar indicador de carga
            this.showLoadingIndicator();
            
            // Obtener contenido de la página
            const content = await this.loadPageContent(page);
            
            if (content) {
                // Actualizar contenido principal
                this.updateMainContent(content, config);
                
                // Actualizar estado
                this.currentPage = page;
                
                // Actualizar URL y título
                this.updateBrowserState(page, config, pushState);
                
                // Actualizar navegación activa
                this.updateActiveNavigation(page);
                
                // Cargar CSS específico si es necesario
                this.loadPageCSS(config.css);
                
                // Disparar evento personalizado
                this.triggerPageChangeEvent(page);
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
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extraer solo el contenido principal
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
    
    updateMainContent(content, config) {
        const mainContainer = document.querySelector('.contenido-principal');
        if (mainContainer) {
            // Animación de salida
            $(mainContainer).fadeOut(150, () => {
                // Actualizar contenido
                mainContainer.innerHTML = content;
                
                // Actualizar título del body
                document.body.setAttribute('data-title', `UniReportes - ${config.title}`);
                
                // Animación de entrada
                $(mainContainer).fadeIn(200);
                
                // Scroll al top
                mainContainer.scrollTop = 0;
            });
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
        
        // Verificar si ya está cargado
        if (document.getElementById(cssId)) return;
        
        // Crear enlace CSS
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = `css/${cssName}.css`;
        
        // Agregar al head
        document.head.appendChild(link);
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
        const event = new CustomEvent('spaPageChange', {
            detail: { page, config: this.pageConfig[page] }
        });
        document.dispatchEvent(event);
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