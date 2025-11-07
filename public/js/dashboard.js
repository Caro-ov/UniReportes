$(document).ready(function() {
    
    // ===========================
    // DROPDOWN DEL PERFIL
    // ===========================
    
    // Toggle del menú desplegable
    $('.avatar-usuario').click(function(e) {
        e.stopPropagation();
        $('.menu-desplegable').toggleClass('mostrar');
    });

    // Cerrar menú al hacer clic fuera
    $(document).click(function() {
        $('.menu-desplegable').removeClass('mostrar');
    });

    // Prevenir que el menú se cierre al hacer clic dentro, pero permitir
    // que acciones globales como "Cerrar sesión" propaguen para que el
    // handler delegado en `components.js` las reciba.
    $('.menu-desplegable').click(function(e) {
        // Si el click es sobre el enlace de logout, permitir propagación
        if ($(e.target).closest('.logout-btn, .cerrar-sesion').length) {
            return; // dejar que el evento suba al document para que el handler global lo atienda
        }
        e.stopPropagation();
    });
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    // Configurar scroll suave
    $('html').css('scroll-behavior', 'smooth');
    
    // ===========================
    // NAVEGACIÓN SIDEBAR
    // ===========================
    
    // La navegación del sidebar ahora es manejada por el sistema SPA
    // No necesitamos manejar navegación aquí ya que spa-navigation.js se encarga
    
    // ===========================
    // BOTONES DE ACCIÓN PRINCIPAL
    // ===========================
    
    // Botón principal "Crear nuevo reporte"
    $('.boton-principal').on('click', function(e) {
        e.preventDefault();
        
        // Agregar efecto visual
        const $boton = $(this);
        $boton.addClass('presionado');
        
        // Usar navegación SPA en lugar de redirección directa
        setTimeout(function() {
            if (window.spaNav) {
                window.spaNav.navigateTo('crear-reporte');
            } else {
                window.location.href = 'crear-reporte.html';
            }
        }, 200);
    });
    
    // ===========================
    // TARJETAS DE OPCIONES
    // ===========================
    
    // Manejar clic en tarjetas de opciones con navegación SPA
    $('.tarjeta-opcion[data-spa-nav]').on('click', function(e) {
        e.preventDefault();
        
        const $tarjeta = $(this);
        const destino = $tarjeta.data('spa-nav');
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Efecto visual
        $tarjeta.addClass('seleccionada');
        setTimeout(() => $tarjeta.removeClass('seleccionada'), 200);
        
        console.log('Navegando a:', destino);
        
        // Usar navegación SPA
        setTimeout(() => {
            if (window.spaNav) {
                window.spaNav.navigateTo(destino);
            } else {
                // Fallback a navegación tradicional
                window.location.href = destino + '.html';
            }
        }, 300);
    });
    
    // Manejar clic en tarjetas de opciones con navegación SPA
    $('.tarjeta-opcion[data-spa-nav]').on('click', function(e) {
        e.preventDefault();
        
        const $tarjeta = $(this);
        const destino = $tarjeta.data('spa-nav');
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Efecto visual
        $tarjeta.addClass('seleccionada');
        setTimeout(() => $tarjeta.removeClass('seleccionada'), 200);
        
        console.log('Navegando a:', destino);
        
        // Usar navegación SPA
        setTimeout(() => {
            if (window.spaNav) {
                window.spaNav.navigateTo(destino);
            } else {
                // Fallback a navegación tradicional
                window.location.href = destino + '.html';
            }
        }, 300);
    });
    
    // Manejar clic en tarjetas de opciones SIN data-spa-nav (para compatibilidad hacia atrás)
    $('.tarjeta-opcion:not([data-spa-nav])').on('click', function(e) {
        e.preventDefault();
        
        const $tarjeta = $(this);
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Agregar efecto visual
        $tarjeta.addClass('seleccionada');
        
        let destino = '';
        
        if (titulo.includes('Explorar reportes') || titulo.includes('reportes')) {
            destino = 'mis-reportes';
        } else if (titulo.includes('Crear') || titulo.includes('nuevo reporte')) {
            destino = 'crear-reporte';
        }
        
        if (destino) {
            setTimeout(function() {
                if (window.spaNav) {
                    window.spaNav.navigateTo(destino);
                } else {
                    window.location.href = destino + '.html';
                }
            }, 300);
        }
    });
    
    // ===========================
    // HEADER Y CONTROLES
    // ===========================
    
    // Botón de notificaciones
    $('.boton-notificaciones').on('click', function(e) {
        e.preventDefault();
        
        // Simular apertura de panel de notificaciones
        mostrarNotificaciones();
    });
    
    // Perfil de usuario
    $('.perfil-usuario').on('click', function(e) {
        e.preventDefault();
        
        // Simular menú de perfil
        mostrarMenuPerfil();
    });
    
    // ===========================
    // FUNCIONES DE NOTIFICACIONES
    // ===========================
    
    function mostrarNotificaciones() {
        // Crear panel de notificaciones temporal
        const $panel = $(`
            <div class="panel-notificaciones">
                <div class="header-panel">
                    <h3>Notificaciones</h3>
                    <button class="cerrar-panel">&times;</button>
                </div>
                <div class="contenido-panel">
                    <div class="notificacion-item">
                        <span class="material-symbols-outlined">check_circle</span>
                        <div>
                            <p><strong>Reporte #12350 actualizado</strong></p>
                            <p class="tiempo">Hace 2 horas</p>
                        </div>
                    </div>
                    <div class="notificacion-item">
                        <span class="material-symbols-outlined">info</span>
                        <div>
                            <p><strong>Nuevo reporte asignado</strong></p>
                            <p class="tiempo">Hace 1 día</p>
                        </div>
                    </div>
                    <div class="notificacion-item">
                        <span class="material-symbols-outlined">schedule</span>
                        <div>
                            <p><strong>Mantenimiento programado</strong></p>
                            <p class="tiempo">Hace 2 días</p>
                        </div>
                    </div>
                </div>
                <div class="footer-panel">
                    <a href="#" class="ver-todos" data-spa-nav="mis-reportes">Ver todos los reportes</a>
                </div>
            </div>
        `);
        
        // Agregar al body
        $('body').append($panel);
        
        // Mostrar con animación
        setTimeout(function() {
            $panel.addClass('mostrar');
        }, 10);
        
        // Cerrar panel
        $panel.find('.cerrar-panel').on('click', function() {
            $panel.removeClass('mostrar');
            setTimeout(function() {
                $panel.remove();
            }, 300);
        });
        
        // Manejar navegación SPA en enlaces del panel
        $panel.find('[data-spa-nav]').on('click', function(e) {
            e.preventDefault();
            const page = $(this).data('spa-nav');
            if (window.spaNav) {
                window.spaNav.navigateTo(page);
            }
            // Cerrar panel
            $panel.removeClass('mostrar');
            setTimeout(function() {
                $panel.remove();
            }, 300);
        });
        
        // Cerrar al hacer clic fuera
        $(document).on('click.notificaciones', function(e) {
            if (!$panel.is(e.target) && $panel.has(e.target).length === 0) {
                $panel.removeClass('mostrar');
                setTimeout(function() {
                    $panel.remove();
                    $(document).off('click.notificaciones');
                }, 300);
            }
        });
    }
    
    function mostrarMenuPerfil() {
        // Crear menú de perfil temporal
        const $menu = $(`
            <div class="menu-perfil">
                <div class="perfil-info">
                    <div class="avatar-menu"></div>
                    <div class="info-usuario">
                        <p class="nombre-usuario">Juan Pérez</p>
                        <p class="rol-usuario">Monitor</p>
                    </div>
                </div>
                <hr class="separador-menu">
                <ul class="opciones-menu">
                    <li><a href="#" data-spa-nav="perfil"><span class="material-symbols-outlined">person</span>Mi perfil</a></li>
                    <li><a href="#"><span class="material-symbols-outlined">settings</span>Configuración</a></li>
                    <li><a href="#" data-spa-nav="ayuda"><span class="material-symbols-outlined">help</span>Ayuda</a></li>
                    <li><a href="#" class="cerrar-sesion"><span class="material-symbols-outlined">logout</span>Cerrar sesión</a></li>
                </ul>
            </div>
        `);
        
        // Posicionar cerca del botón de perfil
        const $botonPerfil = $('.perfil-usuario');
        const offset = $botonPerfil.offset();
        
        $menu.css({
            position: 'absolute',
            top: offset.top + $botonPerfil.outerHeight() + 10,
            right: 20,
            zIndex: 1000
        });
        
        // Agregar al body
        $('body').append($menu);
        
        // Mostrar con animación
        setTimeout(function() {
            $menu.addClass('mostrar');
        }, 10);
        
        // Cerrar al hacer clic fuera
        $(document).on('click.perfil', function(e) {
            if (!$menu.is(e.target) && $menu.has(e.target).length === 0 && !$botonPerfil.is(e.target)) {
                $menu.removeClass('mostrar');
                setTimeout(function() {
                    $menu.remove();
                    $(document).off('click.perfil');
                }, 300);
            }
        });

        // Manejar logout
        $menu.find('a.cerrar-sesion').on('click', async function(e) {
            e.preventDefault();
            try {
                const res = await fetch('/auth/logout', { method: 'POST' });
                if (res.ok) {
                    window.location.href = 'login.html';
                } else {
                    window.location.href = 'login.html';
                }
            } catch (_) {
                window.location.href = 'login.html';
            }
        });
        
        // Manejar navegación SPA en enlaces del menú
        $menu.find('[data-spa-nav]').on('click', function(e) {
            e.preventDefault();
            const page = $(this).data('spa-nav');
            if (window.spaNav) {
                window.spaNav.navigateTo(page);
            }
            // Cerrar menú
            $menu.removeClass('mostrar');
            setTimeout(function() {
                $menu.remove();
                $(document).off('click.perfil');
            }, 300);
        });
    }
    
    // ===========================
    // EFECTOS VISUALES
    // ===========================
    
    // Efecto hover para tarjetas de opción
    $('.tarjeta-opcion').on('mouseenter', function() {
        $(this).find('.icono-opcion').css('transform', 'scale(1.1)');
    }).on('mouseleave', function() {
        $(this).find('.icono-opcion').css('transform', 'scale(1)');
        $(this).removeClass('seleccionada');
    });
    
    // Efecto hover para elementos de navegación
    $('.nav-item').on('mouseenter', function() {
        if (!$(this).hasClass('active')) {
            $(this).css('transform', 'translateX(4px)');
        }
    }).on('mouseleave', function() {
        if (!$(this).hasClass('active')) {
            $(this).css('transform', 'translateX(0)');
        }
    });
    
    // ===========================
    // ANIMACIONES AL CARGAR
    // ===========================
    
    function animarEntrada() {
        // Animar elementos uno por uno
        $('.titulo-pagina').css('opacity', '0').animate({opacity: 1}, 600);
        
        setTimeout(function() {
            $('.descripcion-pagina').css('opacity', '0').animate({opacity: 1}, 600);
        }, 200);
        
        setTimeout(function() {
            $('.tarjeta-opcion').each(function(index) {
                const $tarjeta = $(this);
                setTimeout(function() {
                    $tarjeta.css({
                        opacity: '0',
                        transform: 'translateY(20px)'
                    }).animate({
                        opacity: 1
                    }, 600).css('transform', 'translateY(0)');
                }, index * 150);
            });
        }, 400);
        
        setTimeout(function() {
            $('.boton-principal').css('opacity', '0').animate({opacity: 1}, 600);
        }, 800);
    }
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    // Función para mostrar mensajes toast
    function mostrarToast(mensaje, tipo = 'info') {
        const $toast = $(`
            <div class="toast toast-${tipo}">
                <span class="material-symbols-outlined">${tipo === 'success' ? 'check_circle' : 'info'}</span>
                <span>${mensaje}</span>
            </div>
        `);
        
        $('body').append($toast);
        
        setTimeout(function() {
            $toast.addClass('mostrar');
        }, 100);
        
        setTimeout(function() {
            $toast.removeClass('mostrar');
            setTimeout(function() {
                $toast.remove();
            }, 300);
        }, 3000);
    }
    
    // ===========================
    // MANEJO DE RESPONSIVE
    // ===========================
    
    function manejarResponsive() {
        if (window.innerWidth <= 768) {
            // Ajustes para móvil
            $('.grid-opciones').addClass('mobile-stack');
        } else {
            $('.grid-opciones').removeClass('mobile-stack');
        }
    }
    
    // ===========================
    // EVENT LISTENERS GLOBALES
    // ===========================
    
    // Resize window
    $(window).on('resize', manejarResponsive);
    
    // Teclas de navegación rápida
    $(document).on('keydown', function(e) {
        // Solo si no hay modales abiertos
        if ($('.panel-notificaciones, .menu-perfil').length === 0) {
            switch(e.key) {
                case '1':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (window.spaNav) {
                            window.spaNav.navigateTo('dashboard');
                        }
                    }
                    break;
                case '2':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (window.spaNav) {
                            window.spaNav.navigateTo('mis-reportes');
                        }
                    }
                    break;
                case '3':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (window.spaNav) {
                            window.spaNav.navigateTo('crear-reporte');
                        }
                    }
                    break;
                case 'n':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        if (window.spaNav) {
                            window.spaNav.navigateTo('crear-reporte');
                        }
                    }
                    break;
            }
        }
    });
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    function inicializar() {
        manejarResponsive();
        animarEntrada();
        
        // Mostrar mensaje de bienvenida si es la primera visita
        if (!localStorage.getItem('dashboard-visitado')) {
            setTimeout(function() {
                mostrarToast('¡Bienvenido al dashboard de UniReportes!', 'success');
                localStorage.setItem('dashboard-visitado', 'true');
            }, 1500);
        }
    }
    
    // Ejecutar inicialización
    inicializar();
    
    // ===========================
    // MENÚ DESPLEGABLE DEL PERFIL
    // ===========================
    
    // Manejar click en foto de perfil
    $('#dropdownPerfil').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $menu = $('#menuPerfil');
        $menu.toggleClass('mostrar');
    });
    
    // Cerrar menú al hacer click fuera
    $(document).on('click', function(e) {
        const $menu = $('#menuPerfil');
        if (!$(e.target).closest('.dropdown-perfil').length) {
            $menu.removeClass('mostrar');
        }
    });
    
    // Manejar opciones del menú
    $('.opcion-menu').on('click', function(e) {
        const href = $(this).attr('href');
        const texto = $(this).text().trim();
        
        if (href === '#') {
            e.preventDefault();
        }
        
        // Cerrar menú
        $('#menuPerfil').removeClass('mostrar');
        
        // Manejar acciones específicas
        if (texto === 'Cerrar Sesión') {
            e.preventDefault();
            const confirmar = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (confirmar) {
                mostrarToast('Cerrando sesión...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } else if (texto === 'Configuración') {
            e.preventDefault();
            mostrarToast('Configuración próximamente disponible', 'info');
        }
    });
    
    // Cerrar menú con tecla Escape
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#menuPerfil').removeClass('mostrar');
        }
    });
    
    // Logging para desarrollo
    console.log('Dashboard JavaScript inicializado');
    console.log('Atajos de teclado disponibles:');
    console.log('- Ctrl+1: Ir a Dashboard');
    console.log('- Ctrl+2: Ir a Mis Reportes');
    console.log('- Ctrl+3: Ir a Crear Reporte');
    console.log('- Ctrl+N: Nuevo Reporte');
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para navegación programática
function navegarA(pagina) {
    const destinos = {
        'dashboard': 'dashboard.html',
        'mis-reportes': 'mis-reportes.html',
        'crear-reporte': 'crear-reporte.html',
        'ayuda': 'ayuda.html'
    };
    
    const destino = destinos[pagina] || 'dashboard.html';
    if (window.spaNav) {
        window.spaNav.navigateTo(pagina);
    } else {
        window.location.href = destino;
    }
}

// Función para crear nuevo reporte directamente
function nuevoReporte() {
    if (window.spaNav) {
        window.spaNav.navigateTo('crear-reporte');
    } else {
        window.location.href = 'crear-reporte.html';
    }
}
