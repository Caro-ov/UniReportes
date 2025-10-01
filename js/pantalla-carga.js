$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    const DURACION_CARGA = 3000; // 3 segundos
    const MENSAJES_CARGA = [
        'Estableciendo conexión segura...',
        'Verificando credenciales...',
        'Cargando datos del usuario...',
        'Preparando la interfaz...',
        'Casi listo...'
    ];
    
    let progreso = 0;
    let mensajeActual = 0;
    let intervaloCarga;
    let intervaloMensaje;
    
    // ===========================
    // FUNCIONES DE CARGA
    // ===========================
    
    // Función para actualizar el progreso
    function actualizarProgreso() {
        const incremento = 100 / (DURACION_CARGA / 100);
        progreso += incremento;
        
        if (progreso >= 100) {
            progreso = 100;
            completarCarga();
        }
        
        // Actualizar barra de progreso (ya está animada con CSS)
        console.log(`Progreso: ${Math.round(progreso)}%`);
    }
    
    // Función para cambiar mensajes de estado
    function cambiarMensaje() {
        if (mensajeActual < MENSAJES_CARGA.length - 1) {
            mensajeActual++;
            $('.mensaje-estado').fadeOut(300, function() {
                $(this).text(MENSAJES_CARGA[mensajeActual]).fadeIn(300);
            });
        }
    }
    
    // Función para completar la carga
    function completarCarga() {
        clearInterval(intervaloCarga);
        clearInterval(intervaloMensaje);
        
        // Agregar clase de completado
        $('body').addClass('carga-completada');
        
        // Cambiar mensaje final
        $('.mensaje-estado').fadeOut(300, function() {
            $(this).text('¡Conexión establecida!').fadeIn(300);
        });
        
        // Cambiar icono a check
        setTimeout(function() {
            $('.icono-principal').text('check_circle');
        }, 500);
        
        // Redireccionar después de mostrar éxito
        setTimeout(function() {
            redirigir();
        }, 1500);
    }
    
    // Función para redireccionar
    function redirigir() {
        // Determinar a dónde redireccionar basado en parámetros URL
        const urlParams = new URLSearchParams(window.location.search);
        const destino = urlParams.get('destino');
        
        let paginaDestino = 'dashboard.html'; // Por defecto
        
        // Mapear destinos específicos
        if (destino === 'login.html') {
            paginaDestino = 'login.html';
        } else if (destino === 'registro.html') {
            paginaDestino = 'registro.html';
        } else if (destino === 'dashboard.html') {
            paginaDestino = 'dashboard.html';
        }
        
        // Agregar efecto de salida
        $('.tarjeta-carga').addClass('slide-up-exit');
        
        setTimeout(function() {
            window.location.href = paginaDestino;
        }, 600);
    }
    
    // ===========================
    // EFECTOS VISUALES
    // ===========================
    
    // Función para crear partículas flotantes (opcional)
    function crearParticulas() {
        const particula = $('<div class="particula"></div>');
        particula.css({
            position: 'absolute',
            width: Math.random() * 6 + 2 + 'px',
            height: Math.random() * 6 + 2 + 'px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: '100%',
            pointerEvents: 'none',
            zIndex: 0
        });
        
        $('.contenedor-principal').append(particula);
        
        particula.animate({
            top: '-10%',
            opacity: 0
        }, Math.random() * 3000 + 2000, function() {
            $(this).remove();
        });
    }
    
    // ===========================
    // MANEJO DE ERRORES
    // ===========================
    
    // Función para manejar errores de carga
    function manejarError(mensaje = 'Error de conexión') {
        clearInterval(intervaloCarga);
        clearInterval(intervaloMensaje);
        
        $('.mensaje-estado').fadeOut(300, function() {
            $(this).text(mensaje).css('color', '#ef4444').fadeIn(300);
        });
        
        $('.icono-principal').text('error').css('color', '#ef4444');
        $('.progreso-activo').css('background', '#ef4444');
        
        // Mostrar botón de reintentar después de un momento
        setTimeout(function() {
            mostrarBotonReintentar();
        }, 2000);
    }
    
    // Función para mostrar botón de reintentar
    function mostrarBotonReintentar() {
        const botonReintentar = $(`
            <button class="boton-reintentar">
                <span class="material-symbols-outlined">refresh</span>
                Reintentar
            </button>
        `);
        
        botonReintentar.css({
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        });
        
        botonReintentar.on('click', function() {
            location.reload();
        });
        
        $('.tarjeta-carga').append(botonReintentar);
    }
    
    // ===========================
    // DETECTAR PROBLEMAS DE RED
    // ===========================
    
    // Verificar conectividad
    function verificarConectividad() {
        if (!navigator.onLine) {
            manejarError('Sin conexión a internet');
            return false;
        }
        return true;
    }
    
    // Event listeners para cambios de conectividad
    window.addEventListener('online', function() {
        if ($('.boton-reintentar').length > 0) {
            location.reload();
        }
    });
    
    window.addEventListener('offline', function() {
        manejarError('Conexión perdida');
    });
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    // Función para simular una verificación real
    function simularVerificacion() {
        return new Promise((resolve, reject) => {
            // Simular una llamada a la API
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de éxito
                    resolve('Verificación exitosa');
                } else {
                    reject('Error en verificación');
                }
            }, 1000);
        });
    }
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    function iniciarCarga() {
        // Verificar conectividad inicial
        if (!verificarConectividad()) {
            return;
        }
        
        // Crear efecto de partículas ocasionalmente
        setInterval(crearParticulas, 800);
        
        // Iniciar actualización de progreso
        intervaloCarga = setInterval(actualizarProgreso, 100);
        
        // Cambiar mensajes cada cierto tiempo
        intervaloMensaje = setInterval(cambiarMensaje, DURACION_CARGA / MENSAJES_CARGA.length);
        
        // Simular verificación en paralelo
        simularVerificacion()
            .then(resultado => {
                console.log('Verificación exitosa:', resultado);
            })
            .catch(error => {
                console.warn('Error en verificación:', error);
                // No mostrar error al usuario a menos que sea crítico
            });
    }
    
    // ===========================
    // PREVENCIÓN DE NAVEGACIÓN
    // ===========================
    
    // Prevenir que el usuario navegue hacia atrás durante la carga
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function() {
        window.history.pushState(null, null, window.location.href);
    });
    
    // ===========================
    // EJECUCIÓN PRINCIPAL
    // ===========================
    
    // Iniciar todo después de que la página esté completamente cargada
    setTimeout(iniciarCarga, 500);
    
    // ===========================
    // DEBUG (solo para desarrollo)
    // ===========================
    
    // Función para saltarse la carga (solo para desarrollo)
    if (window.location.search.includes('skip=true')) {
        setTimeout(function() {
            completarCarga();
        }, 500);
    }
    
    // Logging para desarrollo
    console.log('Pantalla de carga inicializada');
    console.log('Duración estimada:', DURACION_CARGA / 1000, 'segundos');
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para forzar la finalización (puede ser llamada externamente)
window.finalizarCarga = function() {
    $('.carga-completada').removeClass('carga-completada');
    setTimeout(function() {
        $('.tarjeta-carga').addClass('slide-up-exit');
        setTimeout(function() {
            window.location.href = 'dashboard.html';
        }, 600);
    }, 100);
};