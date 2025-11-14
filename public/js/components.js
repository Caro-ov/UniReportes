// PRECARGA INMEDIATA DE CSS (antes de document ready)
(function() {
    const pageCSS = document.body.getAttribute('data-css');
    if (pageCSS) {
        const existingLink = document.querySelector('link[href="css/' + pageCSS + '.css"]');
        if (!existingLink) {
            console.log('Precargando CSS específico:', pageCSS);
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/' + pageCSS + '.css';
            document.head.appendChild(link);
        }
    }
})();

// Sistema de carga de componentes reutilizables (OPTIMIZADO)
$(document).ready(function() {
    console.log('Componentes iniciando...');
    
    // Verificar sesión al cargar cualquier página protegida
    verifySession();
    
    // Función para cargar componentes HTML únicamente
    function loadComponent(selector, path, callback) {
        $.get(path)
            .done(function(data) {
                $(selector).html(data);
                if (callback) callback();
            })
            .fail(function() {
                console.error('Error al cargar el componente:', path);
            });
    }

    // NO cargar head común - ya está estático en cada página
    
    // Cargar sidebar
    if ($('#sidebar-container').length) {
        // Consultar el rol del usuario desde el servidor
        $.get('/api/users/profile')
            .done(function(response) {
                console.log('Datos del usuario obtenidos:', response);
                const userRole = response.success && response.data ? response.data.rol : null;
                console.log('Rol del usuario:', userRole);
                // Exponer rol globalmente para que otras partes del cliente puedan decidir rutas
                try { window.currentUserRole = userRole; } catch(e) { console.warn('No se pudo exponer currentUserRole globalmente', e); }
                
                // Determinar qué sidebar cargar según el rol del usuario
                const sidebarPath = userRole === 'admin' ? 'components/sidebar-admin.html' : 'components/sidebar.html';
                console.log('Cargando sidebar desde:', sidebarPath);
                
                loadComponent('#sidebar-container', sidebarPath, function() {
                    setActiveMenuItem();
                    initializeSidebarFunctionality();
                    
                    // Disparar evento para indicar que el sidebar está listo
                    $(document).trigger('sidebarLoaded');
                });
            })
            .fail(function(xhr, status, error) {
                console.error('Error al obtener rol del usuario:', error);
                // Fallback: usar sidebar normal si no se puede obtener el rol
                console.log('Usando sidebar normal como fallback');
                loadComponent('#sidebar-container', 'components/sidebar.html', function() {
                    setActiveMenuItem();
                    initializeSidebarFunctionality();
                    
                    // Disparar evento para indicar que el sidebar está listo
                    $(document).trigger('sidebarLoaded');
                });
            });
    }

    // Cargar header
    if ($('#header-container').length) {
        loadComponent('#header-container', 'components/header.html', function() {
            console.log('✅ Header cargado');
            initializeHeaderFunctionality();
            loadUserDataInHeader();
            
            // Esperar un poco para asegurar que el DOM esté completamente listo
            setTimeout(() => {
                loadNotificationSystem();
            }, 500);
        });
    }

    // Función para establecer el elemento activo del menú
    function setActiveMenuItem() {
        const currentPage = $('body').data('page');
        console.log('Estableciendo elemento activo para página:', currentPage);
        
        // Remover cualquier clase active previa
        $('.sidebar-nav .nav-item').removeClass('active');
        
        if (currentPage) {
            const menuItem = $('.sidebar-nav a[data-page="' + currentPage + '"]');
            if (menuItem.length > 0) {
                menuItem.addClass('active');
                console.log('Elemento de menú marcado como activo:', currentPage);
            } else {
                console.log('No se encontró enlace del sidebar para la página:', currentPage);
            }
        }
    }

    // Función para inicializar la funcionalidad del sidebar
    function initializeSidebarFunctionality() {
        // Funcionalidad para cerrar sidebar en móvil con event delegation
        $(document).off('click.overlay').on('click.overlay', '.overlay', function() {
            toggleSidebar();
        });

        // Manejar botón de menú móvil con event delegation
        $(document).off('click.menuMovil').on('click.menuMovil', '.boton-menu-movil', function() {
            toggleSidebar();
        });
    }

    // Función para inicializar la funcionalidad del header
    function initializeHeaderFunctionality() {
        // Manejar dropdown del usuario con event delegation
        $(document).off('click.header').on('click.header', '.user-dropdown, .dropdown-perfil', function(e) {
            e.stopPropagation();
            $(this).toggleClass('open');
            $('.menu-desplegable', this).toggleClass('mostrar');
        });

        // Cerrar dropdown al hacer clic fuera
        $(document).off('click.headerClose').on('click.headerClose', function() {
            $('.user-dropdown, .dropdown-perfil').removeClass('open');
            $('.menu-desplegable').removeClass('mostrar');
        });

        // Manejar notificaciones con event delegation
        $(document).off('click.notifications').on('click.notifications', '.notification-btn, .boton-notificaciones', function(e) {
            e.stopPropagation();
            // Cerrar dropdown de perfil si está abierto
            $('.user-dropdown, .dropdown-perfil').removeClass('open');
            $('.menu-desplegable').removeClass('mostrar');
            // El sistema de notificaciones maneja el toggle del panel
        });

        // Manejar logout con event delegation
        $(document).off('click.logout').on('click.logout', '.logout-btn, .cerrar-sesion', function(e) {
            e.preventDefault();
            mostrarModalLogout();
        });

        // Funcionalidad del modal de logout con event delegation
        $(document).off('click.modalCancel').on('click.modalCancel', '#btn-cancelar-logout', function() {
            ocultarModalLogout();
        });

        $(document).off('click.modalConfirm').on('click.modalConfirm', '#btn-confirmar-logout', function() {
            ocultarModalLogout();
            procesarLogout();
        });

        // Cerrar modal al hacer clic fuera de él con event delegation
        $(document).off('click.modalClose').on('click.modalClose', '#modal-logout', function(e) {
            if (e.target === this) {
                ocultarModalLogout();
            }
        });

        // Cerrar modal con ESC
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#modal-logout').hasClass('mostrar')) {
                ocultarModalLogout();
            }
        });
    }

    // Función para mostrar/ocultar sidebar en móvil
    function toggleSidebar() {
        $('.sidebar').toggleClass('abierto');
        $('.overlay').toggleClass('mostrar');
    }

    // Cargar y inicializar sistema de notificaciones
    function loadNotificationSystem() {
        console.log('🔔 Iniciando sistema de notificaciones...');
        
        // Verificar si el script de notificaciones ya está cargado
        if (typeof NotificationManager === 'undefined') {
            console.log('📦 Cargando script de notificaciones...');
            // Cargar script de notificaciones
            const script = document.createElement('script');
            script.src = 'js/notificaciones.js';
            script.onload = function() {
                // Inicializar después de cargar
                console.log('✅ Script de notificaciones cargado');
                window.notificationManager = new NotificationManager();
                window.notificationManager.init();
                console.log('🚀 Sistema de notificaciones iniciado');
            };
            script.onerror = function() {
                console.error('❌ Error al cargar el script de notificaciones');
            };
            document.head.appendChild(script);
        } else {
            // Ya está cargado, solo inicializar
            console.log('✅ Script de notificaciones ya estaba cargado');
            if (!window.notificationManager) {
                window.notificationManager = new NotificationManager();
                window.notificationManager.init();
                console.log('🚀 Sistema de notificaciones iniciado');
            } else {
                console.log('ℹ️ Sistema de notificaciones ya estaba iniciado');
            }
        }
    }

    // Función para mostrar toast notifications
    function mostrarToast(mensaje, tipo = 'info') {
        const tiposClases = {
            'success': 'toast-success',
            'error': 'toast-error',
            'warning': 'toast-warning',
            'info': ''
        };

        const toast = $(`
            <div class="toast ${tiposClases[tipo] || ''}">
                <span class="material-symbols-outlined">${getIconoTipo(tipo)}</span>
                <span>${mensaje}</span>
            </div>
        `);

        $('body').append(toast);
        
        setTimeout(() => {
            toast.addClass('mostrar');
        }, 100);

        setTimeout(() => {
            toast.removeClass('mostrar');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Función auxiliar para obtener iconos según el tipo
    function getIconoTipo(tipo) {
        const iconos = {
            'success': 'check_circle',
            'error': 'error',
            'warning': 'warning',
            'info': 'info'
        };
        return iconos[tipo] || 'info';
    }

    // Función para verificar la sesión del usuario
    function verifySession() {
        // Solo verificar en páginas que no sean login
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('index.html') ||
            window.location.pathname === '/') {
            return;
        }
        
        $.get('/api/users/profile')
            .fail(function(xhr) {
                if (xhr.status === 401) {
                    console.warn('Sesión expirada o inválida, redirigiendo al login');
                    // Limpiar el historial para prevenir navegación hacia atrás
                    if (window.history && window.history.pushState) {
                        window.history.replaceState(null, null, '/login.html');
                    }
                    window.location.replace('/login.html');
                }
            });
    }

    // Función para cargar datos del usuario en el header
    function loadUserDataInHeader() {
        $.get('/api/users/profile')
            .done(function(response) {
                if (response.success && response.data) {
                    const user = response.data;
                    console.log('Cargando datos del usuario en header:', user);
                    
                    // Actualizar nombre del usuario
                    $('.usuario-nombre-header').text(user.nombre || 'Usuario');
                    
                    // Actualizar rol del usuario con formato amigable
                    const rolDisplay = user.rol === 'admin' ? 'Administrador' : 'Monitor';
                    $('.usuario-rol-header').text(rolDisplay);
                    // También asegurar que el rol esté disponible globalmente
                    try { window.currentUserRole = user.rol; } catch(e) { console.warn('No se pudo exponer currentUserRole desde el header', e); }
                } else {
                    console.warn('No se pudieron obtener los datos del usuario para el header');
                }
            })
            .fail(function(xhr, status, error) {
                console.error('Error al cargar datos del usuario en header:', error);
                if (xhr.status === 401) {
                    // Sesión expirada
                    window.location.replace('/login.html');
                    return;
                }
                // Mantener valores por defecto si falla por otra razón
                $('.usuario-nombre-header').text('Usuario');
                $('.usuario-rol-header').text('Monitor');
            });
    }

    // Funciones para el modal de logout
    function mostrarModalLogout() {
        $('#modal-logout').addClass('mostrar');
        // Enfocar el botón de cancelar para accesibilidad
        setTimeout(() => {
            $('#btn-cancelar-logout').focus();
        }, 100);
    }

    function ocultarModalLogout() {
        $('#modal-logout').removeClass('mostrar');
    }

    function procesarLogout() {
        mostrarToast('Cerrando sesión...', 'info');
        
        // Marcar flag de logout para prevenir navegación hacia atrás
        sessionStorage.setItem('logout_flag', 'true');
        
        // Hacer petición al servidor para cerrar sesión
        $.post('/auth/logout')
            .done(function(response) {
                if (response.success) {
                    // Limpiar el historial del navegador para prevenir navegación hacia atrás
                    if (window.history && window.history.pushState) {
                        window.history.replaceState(null, null, '/login.html');
                        window.history.pushState(null, null, '/login.html');
                        
                        // Prevenir navegación hacia atrás
                        window.addEventListener('popstate', function(event) {
                            window.history.pushState(null, null, '/login.html');
                        });
                    }
                    
                    // Redirigir al login
                    window.location.replace('/login.html');
                } else {
                    mostrarToast('Error al cerrar sesión', 'error');
                }
            })
            .fail(function() {
                mostrarToast('Error de conexión al cerrar sesión', 'error');
                // Forzar redirección incluso si falla
                setTimeout(() => {
                    window.location.replace('/login.html');
                }, 1000);
            });
    }

    // Hacer funciones globales para compatibilidad
    window.toggleSidebar = toggleSidebar;
    window.mostrarToast = mostrarToast;
    window.mostrarModalLogout = mostrarModalLogout;
});