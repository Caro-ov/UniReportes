$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    // Configurar scroll suave para navegación interna
    $('html').css('scroll-behavior', 'smooth');
    
    // ===========================
    // NAVEGACIÓN Y MENÚ
    // ===========================
    
    // Navegación suave para enlaces internos
    $('.menu-enlace').on('click', function(e) {
        const href = $(this).attr('href');
        
        // Si es un enlace interno (comienza con #)
        if (href.startsWith('#')) {
            e.preventDefault();
            
            const target = $(href);
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 800, 'easeInOutCubic');
            }
        }
    });
    
    // Resaltar enlace activo en el menú según la sección visible
    function actualizarMenuActivo() {
        const secciones = ['hero', 'seccion-beneficios', 'tarjetas-reportes'];
        const scrollTop = $(window).scrollTop();
        
        let seccionActiva = '';
        
        secciones.forEach(function(seccion) {
            const elemento = $('.' + seccion);
            if (elemento.length) {
                const offset = elemento.offset().top - 100;
                const height = elemento.outerHeight();
                
                if (scrollTop >= offset && scrollTop < offset + height) {
                    seccionActiva = seccion;
                }
            }
        });
        
        // Remover clase activa de todos los enlaces
        $('.menu-enlace').removeClass('activo');
        
        // Agregar clase activa al enlace correspondiente
        if (seccionActiva) {
            $('.menu-enlace[href="#' + seccionActiva + '"]').addClass('activo');
        }
    }
    
    // ===========================
    // BOTONES DE ACCIÓN
    // ===========================
    
    // Botón "Iniciar Sesión"
    $('.boton-secundario').on('click', function(e) {
        e.preventDefault();
        
        // Redireccionar directamente a login
        window.location.href = 'login.html';
    });
    
    // Botón "Registrarse"
    $('.boton-principal').on('click', function(e) {
        e.preventDefault();
        
        const $boton = $(this);
        const href = $boton.attr('href');
        
        // Si el botón es "Comenzar" (hero)
        if ($boton.text().trim() === 'Comenzar') {
            // Scroll hacia la sección de beneficios
            $('html, body').animate({
                scrollTop: $('.seccion-beneficios').offset().top - 80
            }, 1000, 'easeInOutCubic');
            return;
        }
        
        // Para el botón de registro del header - redirigir al login por ahora
        window.location.href = 'login.html';
    });
    
    // ===========================
    // ANIMACIONES AL SCROLL
    // ===========================
    
    // Configurar intersection observer para animaciones
    function configurarAnimaciones() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    $(entry.target).addClass('animado');
                }
            });
        }, observerOptions);
        
        // Observar elementos que necesitan animación
        $('.tarjeta-beneficio, .tarjeta-reporte').each(function() {
            observer.observe(this);
        });
    }
    
    // Animación de fade-in para las tarjetas
    function inicializarAnimacionesTarjetas() {
        $('.tarjeta-beneficio, .tarjeta-reporte').each(function(index) {
            $(this).css({
                'opacity': '0',
                'transform': 'translateY(30px)',
                'transition': 'all 0.6s ease-out'
            }).attr('data-delay', index * 100);
        });
    }
    
    // ===========================
    // EFECTOS HOVER Y INTERACCIONES
    // ===========================
    
    // Efecto hover mejorado para tarjetas de reportes
    $('.tarjeta-reporte').on('mouseenter', function() {
        $(this).find('.imagen-reporte').css('transform', 'scale(1.05)');
        $(this).css('transform', 'translateY(-5px)');
    }).on('mouseleave', function() {
        $(this).find('.imagen-reporte').css('transform', 'scale(1)');
        $(this).css('transform', 'translateY(0)');
    });
    
    // Efecto hover para tarjetas de beneficios
    $('.tarjeta-beneficio').on('mouseenter', function() {
        $(this).find('.icono-beneficio').css('transform', 'scale(1.1) rotate(5deg)');
    }).on('mouseleave', function() {
        $(this).find('.icono-beneficio').css('transform', 'scale(1) rotate(0deg)');
    });
    
    // Efecto ripple para botones
    $('.boton').on('click', function(e) {
        const $boton = $(this);
        const ripple = $('<span class="ripple"></span>');
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.css({
            width: size + 'px',
            height: size + 'px',
            left: x + 'px',
            top: y + 'px'
        });
        
        $boton.append(ripple);
        
        setTimeout(function() {
            ripple.remove();
        }, 600);
    });
    
    // ===========================
    // HEADER SCROLL EFFECT
    // ===========================
    
    // Efecto de transparencia en el header al hacer scroll
    function efectoScrollHeader() {
        const scrollTop = $(window).scrollTop();
        const $header = $('.encabezado');
        
        if (scrollTop > 50) {
            $header.addClass('scroll-activo');
        } else {
            $header.removeClass('scroll-activo');
        }
    }
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    // Función para mostrar notificaciones toast
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
    // EVENT LISTENERS
    // ===========================
    
    // Scroll events
    $(window).on('scroll', function() {
        actualizarMenuActivo();
        efectoScrollHeader();
    });
    
    // Resize events
    $(window).on('resize', function() {
        // Recalcular posiciones si es necesario
        actualizarMenuActivo();
    });
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    // Inicializar todas las funcionalidades
    function inicializar() {
        inicializarAnimacionesTarjetas();
        configurarAnimaciones();
        actualizarMenuActivo();
    }
    
    // Ejecutar inicialización
    inicializar();
    
    // Secuencia de teclas para easter egg (Konami Code simplificado)
    let secuencia = [];
    const codigoSecreto = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    $(document).on('keydown', function(e) {
        secuencia.push(e.keyCode);
        
        if (secuencia.length > codigoSecreto.length) {
            secuencia.shift();
        }
        
        if (secuencia.length === codigoSecreto.length && 
            secuencia.every((key, index) => key === codigoSecreto[index])) {
            
            // Activar easter egg
            $('body').addClass('easter-egg');
            mostrarToast('¡Easter egg activado! 🎉', 'success');
            
            setTimeout(function() {
                $('body').removeClass('easter-egg');
            }, 5000);
        }
    });
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para navegación programática
function navegarA(seccion) {
    const $target = $('.' + seccion);
    if ($target.length) {
        $('html, body').animate({
            scrollTop: $target.offset().top - 80
        }, 800, 'easeInOutCubic');
    }
}

// Función para cambiar tema (para futuras implementaciones)
function cambiarTema(tema) {
    $('body').removeClass('tema-claro tema-oscuro').addClass('tema-' + tema);
    localStorage.setItem('tema-preferido', tema);
}