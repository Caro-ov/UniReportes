$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    console.log('Panel de Administración JavaScript inicializado');
    
    // Cargar estadísticas del dashboard al iniciar
    cargarEstadisticasAdmin();
    
    // ===========================
    // FUNCIONES DE ESTADÍSTICAS
    // ===========================
    
    /**
     * Cargar estadísticas reales para las tarjetas del dashboard
     */
    function cargarEstadisticasAdmin() {
        console.log('Cargando estadísticas del admin dashboard...');
        
        // Mostrar indicadores de carga
        $('#total-reportes, #reportes-pendientes, #resueltos-mes').text('...');
        
        $.ajax({
            url: '/api/dashboard/admin-cards',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                console.log('Respuesta completa del servidor:', response);
                
                if (response.success && response.data) {
                    const stats = response.data;
                    console.log('Datos de estadísticas:', stats);
                    
                    // Actualizar las tarjetas directamente sin animación
                    console.log('Actualizando total-reportes con:', stats.total_reportes);
                    $('#total-reportes').text(stats.total_reportes || 0);
                    console.log('Actualizando reportes-pendientes con:', stats.reportes_pendientes);
                    $('#reportes-pendientes').text(stats.reportes_pendientes || 0);
                    console.log('Actualizando resueltos-mes con:', stats.resueltos_mes);
                    $('#resueltos-mes').text(stats.resueltos_mes || 0);
                    
                    // Verificar que los valores se mantienen después de 2 segundos
                    setTimeout(() => {
                        console.log('Verificando valores después de 2 segundos:');
                        console.log('total-reportes:', $('#total-reportes').text());
                        console.log('reportes-pendientes:', $('#reportes-pendientes').text());
                        console.log('resueltos-mes:', $('#resueltos-mes').text());
                    }, 2000);
                    
                    console.log('Estadísticas actualizadas en las tarjetas');
                } else {
                    console.error('Error en respuesta de estadísticas:', response.message);
                    mostrarErrorEstadisticas();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error completo:', {xhr, status, error});
                console.error('Status HTTP:', xhr.status);
                console.error('Texto de respuesta:', xhr.responseText);
                
                // Si es error 401, intentar de nuevo en 2 segundos
                if (xhr.status === 401) {
                    console.log('Error de autenticación, reintentando en 2 segundos...');
                    setTimeout(cargarEstadisticasAdmin, 2000);
                    return;
                }
                
                mostrarErrorEstadisticas();
            }
        });
    }
    
    /**
     * Mostrar error en las estadísticas
     */
    function mostrarErrorEstadisticas() {
        $('#total-reportes, #reportes-pendientes, #resueltos-mes').text('Error');
        mostrarToast('Error al cargar estadísticas', 'error');
    }
    
    // ===========================
    // INTERACCIONES DEL PANEL
    // ===========================
    
    // Manejar clicks en las tarjetas de opciones con navegación SPA
    $('.tarjeta-opcion[data-spa-nav]').on('click', function() {
        const $tarjeta = $(this);
        const destino = $tarjeta.data('spa-nav');
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Efecto visual
        $tarjeta.addClass('seleccionada');
        setTimeout(() => $tarjeta.removeClass('seleccionada'), 200);
        
        console.log('Admin navegando a:', destino);
        
        // Mostrar toast según el destino
        let mensaje = '';
        switch(destino) {
            case 'explorar-reportes':
                mensaje = 'Redirigiendo a la gestión de reportes...';
                break;
            case 'crear-reporte':
                mensaje = 'Redirigiendo al formulario de reportes...';
                break;
            case 'crear-usuario':
                mensaje = 'Redirigiendo al formulario de usuarios...';
                break;
            default:
                mensaje = 'Redirigiendo...';
        }
        
        mostrarToast(mensaje, 'info');
        
        // Usar navegación SPA
        setTimeout(() => {
            if (window.spaNav) {
                window.spaNav.navigateTo(destino);
            } else {
                // Fallback a navegación tradicional
                window.location.href = destino + '.html';
            }
        }, 1000);
    });
    
    // Manejar clicks en las tarjetas de opciones SIN data-spa-nav (para compatibilidad hacia atrás)
    $('.tarjeta-opcion:not([data-spa-nav])').on('click', function() {
        const $tarjeta = $(this);
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Efecto visual
        $tarjeta.addClass('seleccionada');
        setTimeout(() => $tarjeta.removeClass('seleccionada'), 200);
        
        // Redirigir según la opción
        switch(titulo) {
            case 'Explorar reportes':
                mostrarToast('Redirigiendo a la gestión de reportes...', 'info');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('explorar-reportes');
                    } else {
                        window.location.href = 'mis-reportes.html';
                    }
                }, 1000);
                break;
                
            case 'Crear un nuevo reporte':
                mostrarToast('Redirigiendo al formulario de reportes...', 'info');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('crear-reporte');
                    } else {
                        window.location.href = 'crear-reporte.html';
                    }
                }, 1000);
                break;
                
            case 'Crear nuevo usuario':
                mostrarToast('Redirigiendo al formulario de usuarios...', 'admin');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('crear-usuario');
                    } else {
                        window.location.href = 'crear-usuario.html';
                    }
                }, 1000);
                break;
        }
    });
    
    // Manejar clicks en botones principales
    $('.boton-principal').on('click', function(e) {
        e.stopPropagation(); // Evitar que se dispare el click de la tarjeta
        const $boton = $(this);
        
        // Efecto visual
        $boton.addClass('presionado');
        setTimeout(() => $boton.removeClass('presionado'), 150);
        
        mostrarToast('Redirigiendo al formulario de reportes...', 'success');
    });
    
    $('.boton-secundario').on('click', function(e) {
        e.stopPropagation(); // Evitar que se dispare el click de la tarjeta
        const $boton = $(this);
        
        // Efecto visual
        $boton.addClass('presionado');
        setTimeout(() => $boton.removeClass('presionado'), 150);
        
        mostrarToast('Redirigiendo al formulario de usuarios...', 'admin');
    });
    
    // Efectos hover para las tarjetas de estadísticas
    $('.tarjeta-estadistica').on('mouseenter', function() {
        $(this).find('.numero-estadistica').css('transform', 'scale(1.1)');
    }).on('mouseleave', function() {
        $(this).find('.numero-estadistica').css('transform', 'scale(1)');
    });
    
    // ===========================
    // FUNCIONES AUXILIARES
    // ===========================
    
    // Función para mostrar toasts
    function mostrarToast(mensaje, tipo = 'info') {
        const toast = $(`
            <div class="toast toast-${tipo}">
                <span class="material-symbols-outlined">
                    ${getTipoIcon(tipo)}
                </span>
                <span>${mensaje}</span>
            </div>
        `);
        
        $('body').append(toast);
        
        // Mostrar toast
        setTimeout(() => toast.addClass('mostrar'), 100);
        
        // Ocultar toast después de 3 segundos
        setTimeout(() => {
            toast.removeClass('mostrar');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Función para obtener el icono según el tipo
    function getTipoIcon(tipo) {
        switch(tipo) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'admin': return 'admin_panel_settings';
            default: return 'info';
        }
    }
    
    // ===========================
    // SIMULACIÓN DE DATOS
    // ===========================
    
    // Simular actualización de estadísticas (opcional)
    function actualizarEstadisticas() {
        // Aquí podrías hacer una llamada AJAX para obtener datos reales
        console.log('Estadísticas actualizadas');
    }
    
    // Actualizar estadísticas cada 5 minutos (opcional)
    // setInterval(actualizarEstadisticas, 300000);
    
    console.log('Panel de Administración completamente cargado');
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para navegar a crear usuario
function crearUsuario() {
    if (window.spaNav) {
        window.spaNav.navigateTo('crear-usuario');
    } else {
        window.location.href = 'crear-usuario.html';
    }
}

// Función para navegar a gestión de reportes
function gestionarReportes() {
    if (window.spaNav) {
        window.spaNav.navigateTo('explorar-reportes');
    } else {
        window.location.href = 'mis-reportes.html';
    }
}

// Función para crear nuevo reporte
function crearReporte() {
    if (window.spaNav) {
        window.spaNav.navigateTo('crear-reporte');
    } else {
        window.location.href = 'crear-reporte.html';
    }
}