// Sistema de carga de componentes reutilizables
$(document).ready(function() {
    // Función para cargar componentes HTML
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

    // Cargar head común primero
    if ($('#head-container').length) {
        loadComponent('#head-container', 'components/head-common.html', function() {
            // Agregar título específico de la página
            const pageTitle = $('body').data('title') || 'UniReportes';
            $('title').text(pageTitle);
            
            // Agregar CSS específico de la página si existe
            const pageCSS = $('body').data('css');
            if (pageCSS) {
                console.log('Cargando CSS específico:', pageCSS);
                $('head').append('<link rel="stylesheet" href="css/' + pageCSS + '.css"/>');
            }
            
            // Cargar components.css al final para que tenga prioridad
            console.log('Cargando components.css');
            $('head').append('<link rel="stylesheet" href="css/components.css"/>');
        });
    }

    // Cargar sidebar
    if ($('#sidebar-container').length) {
        // Determinar qué sidebar cargar según el tipo de página
        const currentPage = $('body').data('page');
        console.log('Página actual:', currentPage);
        const isAdminPage = ['admin-home', 'create-user', 'admin-settings', 'explore-reports'].includes(currentPage);
        console.log('Es página admin:', isAdminPage);
        const sidebarPath = isAdminPage ? 'components/sidebar-admin.html' : 'components/sidebar.html';
        console.log('Cargando sidebar desde:', sidebarPath);
        
        loadComponent('#sidebar-container', sidebarPath, function() {
            setActiveMenuItem();
            initializeSidebarFunctionality();
        });
    }

    // Cargar header
    if ($('#header-container').length) {
        loadComponent('#header-container', 'components/header.html', function() {
            initializeHeaderFunctionality();
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
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
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

    // Hacer funciones globales para compatibilidad
    window.toggleSidebar = toggleSidebar;
    window.mostrarToast = mostrarToast;
});