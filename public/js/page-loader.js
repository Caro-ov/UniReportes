/**
 * Script universal para prevenir FOUC y manejar la carga de páginas
 * Este script se ejecuta en todas las páginas para proporcionar una experiencia fluida
 */

(function() {
    'use strict';
    
    // ===========================
    // CONFIGURACIÓN AGRESIVA ANTI-FOUC
    // ===========================
    
    const CONFIG = {
        minLoadingTime: 800,    // Tiempo mínimo más largo para garantizar suavidad
        maxLoadingTime: 5000,   // Tiempo máximo de espera más generoso
        fadeInDuration: 500,    // Fade más suave y largo
        enablePreloader: true,
        forceHideContent: true  // Forzar ocultación total
    };
    
    // ===========================
    // VARIABLES GLOBALES
    // ===========================
    
    let loadStartTime = Date.now();
    let resourcesLoaded = false;
    let domReady = false;
    let pageInitialized = false;
    
    // ===========================
    // SKELETON LOADER
    // ===========================
    
    function createPreloader() {
        if (!CONFIG.enablePreloader) return;
        
        // Asegurar que el HTML esté oculto
        document.documentElement.style.visibility = 'hidden';
        document.documentElement.style.opacity = '0';
        
        const preloader = document.createElement('div');
        preloader.className = 'preloader';
        preloader.id = 'page-preloader';
        
        preloader.innerHTML = `
            <div class="preloader-logo"></div>
            <div class="preloader-text">UniReportes</div>
            <div class="preloader-subtext">Cargando tu dashboard...</div>
            <div class="preloader-spinner"></div>
        `;
        
        // Insertar inmediatamente en el documento
        if (document.body) {
            document.body.appendChild(preloader);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(preloader);
            });
        }
    }
    
    function hidePreloader() {
        const preloader = document.getElementById('page-preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.classList.add('hidden');
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }
    }
    
    // ===========================
    // DETECCIÓN DE RECURSOS
    // ===========================
    
    function checkResourcesLoaded() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        const images = document.querySelectorAll('img');
        
        let loadedCount = 0;
        let totalResources = stylesheets.length + images.length;
        
        if (totalResources === 0) {
            resourcesLoaded = true;
            return;
        }
        
        function resourceLoaded() {
            loadedCount++;
            if (loadedCount >= totalResources) {
                resourcesLoaded = true;
                checkReadyToShow();
            }
        }
        
        // Verificar CSS
        stylesheets.forEach(link => {
            if (link.sheet) {
                resourceLoaded();
            } else {
                link.onload = resourceLoaded;
                link.onerror = resourceLoaded; // Contar errores como "cargados"
            }
        });
        
        // Verificar imágenes
        images.forEach(img => {
            if (img.complete) {
                resourceLoaded();
            } else {
                img.onload = resourceLoaded;
                img.onerror = resourceLoaded;
            }
        });
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!resourcesLoaded) {
                console.warn('Timeout alcanzado esperando recursos');
                resourcesLoaded = true;
                checkReadyToShow();
            }
        }, CONFIG.maxLoadingTime);
    }
    
    // ===========================
    // MOSTRAR PÁGINA
    // ===========================
    
    function showPage() {
        if (pageInitialized) return;
        pageInitialized = true;
        
        const loadEndTime = Date.now();
        const loadTime = loadEndTime - loadStartTime;
        
        console.log(`Página cargada en ${loadTime}ms`);
        
        // Asegurar tiempo mínimo de carga para suavidad
        const remainingTime = Math.max(0, CONFIG.minLoadingTime - loadTime);
        
        setTimeout(() => {
            // Ocultar preloader
            hidePreloader();
            
            // Marcar página como cargada
            document.documentElement.classList.add('fully-loaded');
            document.body.classList.add('loaded');
            
            // Dispatch evento personalizado
            const event = new CustomEvent('pageFullyLoaded', {
                detail: { loadTime: loadTime }
            });
            document.dispatchEvent(event);
            
            // Inicializar componentes específicos
            if (window.initializePageComponents) {
                window.initializePageComponents();
            }
            
            console.log('✅ Página mostrada correctamente');
            
        }, remainingTime);
    }
    
    function checkReadyToShow() {
        if (domReady && resourcesLoaded && !pageInitialized) {
            showPage();
        }
    }
    
    // ===========================
    // EVENT LISTENERS
    // ===========================
    
    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            domReady = true;
            checkResourcesLoaded();
            checkReadyToShow();
        });
    } else {
        domReady = true;
        setTimeout(() => {
            checkResourcesLoaded();
            checkReadyToShow();
        }, 0);
    }
    
    // Window Load (backup)
    window.addEventListener('load', function() {
        resourcesLoaded = true;
        checkReadyToShow();
    });
    
    // ===========================
    // INICIALIZACIÓN INMEDIATA
    // ===========================
    
    // Crear preloader cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPreloader);
    } else {
        createPreloader();
    }
    
    // ===========================
    // FUNCIONES GLOBALES
    // ===========================
    
    // Hacer funciones disponibles globalmente
    window.UniReportes = window.UniReportes || {};
    window.UniReportes.pageLoader = {
        forceShow: showPage,
        isLoaded: () => pageInitialized,
        getLoadTime: () => Date.now() - loadStartTime
    };
    
})();