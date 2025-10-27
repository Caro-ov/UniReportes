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
                
                // Determinar qué sidebar cargar según el rol del usuario
                const sidebarPath = userRole === 'admin' ? 'components/sidebar-admin.html' : 'components/sidebar.html';
                console.log('Cargando sidebar desde:', sidebarPath);
                
                loadComponent('#sidebar-container', sidebarPath, function() {
                    setActiveMenuItem();
                    initializeSidebarFunctionality();
                });
            })
            .fail(function(xhr, status, error) {
                console.error('Error al obtener rol del usuario:', error);
                // Fallback: usar sidebar normal si no se puede obtener el rol
                console.log('Usando sidebar normal como fallback');
                loadComponent('#sidebar-container', 'components/sidebar.html', function() {
                    setActiveMenuItem();
                    initializeSidebarFunctionality();
                });
            });
    }

    // Cargar header
    if ($('#header-container').length) {
        loadComponent('#header-container', 'components/header.html', function() {
            initializeHeaderFunctionality();
            loadUserDataInHeader();
        });
    }

    // Función para establecer el elemento activo del menú
    function setActiveMenuItem() {
        const currentPage = $('body').data('page');
        if (currentPage) {
            $('.sidebar-nav a[data-page="' + currentPage + '"]').addClass('active');
        }
    }

    // Función para inicializar la funcionalidad del sidebar
    function initializeSidebarFunctionality() {
        // Funcionalidad para cerrar sidebar en móvil
        $('.overlay').on('click', function() {
            toggleSidebar();
        });
    }

    // Función para inicializar la funcionalidad del header
    function initializeHeaderFunctionality() {
        // Manejar dropdown del usuario
        $('.user-dropdown, .dropdown-perfil').on('click', function(e) {
            e.stopPropagation();
            $(this).toggleClass('open');
            $('.menu-desplegable', this).toggleClass('mostrar');
        });

        // Cerrar dropdown al hacer clic fuera
        $(document).on('click', function() {
            $('.user-dropdown, .dropdown-perfil').removeClass('open');
            $('.menu-desplegable').removeClass('mostrar');
        });

        // Manejar notificaciones
        $('.notification-btn, .boton-notificaciones').on('click', function(e) {
            e.stopPropagation();
            console.log('Notificaciones clicked');
            // Aquí se puede agregar funcionalidad de notificaciones
            mostrarToast('Notificaciones', 'info');
        });

        // Manejar logout
        $('.logout-btn, .cerrar-sesion').on('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
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
        });

        // Manejar botón de menú móvil
        $('.boton-menu-movil').on('click', function() {
            toggleSidebar();
        });
    }

    // Función para mostrar/ocultar sidebar en móvil
    function toggleSidebar() {
        $('.sidebar').toggleClass('abierto');
        $('.overlay').toggleClass('mostrar');
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

    // Hacer funciones globales para compatibilidad
    window.toggleSidebar = toggleSidebar;
    window.mostrarToast = mostrarToast;
});