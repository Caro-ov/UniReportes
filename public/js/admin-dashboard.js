// Función principal para inicializar el admin dashboard
function initAdminDashboard() {
    console.log('Panel de Administración JavaScript inicializado');
    
    // Cargar estadísticas del dashboard al iniciar
    cargarEstadisticasAdmin();
    
    // Configurar event listeners
    setupAdminEventListeners();
}

// Ejecutar cuando el documento esté listo
$(document).ready(function() {
    initAdminDashboard();
});

// También ejecutar cuando se navegue mediante SPA
document.addEventListener('spaPageChange', function(e) {
    if (e.detail && e.detail.page === 'admin-dashboard') {
        console.log('Admin dashboard cargado vía SPA, inicializando...');
        // Esperar un momento para que el DOM se actualice
        setTimeout(() => {
            initAdminDashboard();
        }, 150);
    }
});

// ===========================
// FUNCIONES DE ESTADÍSTICAS
// ===========================

/**
 * Cargar estadísticas reales para las tarjetas del dashboard
 */
function cargarEstadisticasAdmin() {
    console.log('Cargando estadísticas del admin dashboard...');
    
    // Verificar que los elementos existen
    const elemTotalReportes = $('#total-reportes');
    const elemReportesPendientes = $('#reportes-pendientes');
    const elemResueltosMes = $('#resueltos-mes');
    
    console.log('Elementos encontrados:', {
        totalReportes: elemTotalReportes.length,
        reportesPendientes: elemReportesPendientes.length,
        resueltosMes: elemResueltosMes.length
    });
    
    if (elemTotalReportes.length === 0) {
        console.error('❌ No se encontraron los elementos de estadísticas en el DOM');
        return;
    }
    
    // Mostrar indicadores de carga
    elemTotalReportes.text('...');
    elemReportesPendientes.text('...');
    elemResueltosMes.text('...');
    
    $.ajax({
        url: '/api/dashboard/admin-cards',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            console.log('✅ Respuesta completa del servidor:', response);
            
            if (response.success && response.data) {
                const stats = response.data;
                console.log('Datos de estadísticas:', stats);
                
                // Actualizar las tarjetas
                elemTotalReportes.text(stats.total_reportes || 0);
                elemReportesPendientes.text(stats.reportes_pendientes || 0);
                elemResueltosMes.text(stats.resueltos_mes || 0);
                
                console.log('✅ Estadísticas actualizadas en las tarjetas');
            } else {
                console.error('❌ Error en respuesta de estadísticas:', response.message);
                mostrarErrorEstadisticas();
            }
        },
        error: function(xhr, status, error) {
            console.error('❌ Error completo:', {xhr, status, error});
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
    if (typeof mostrarToast === 'function') {
        mostrarToast('Error al cargar estadísticas', 'error');
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

function setupAdminEventListeners() {
    console.log('Configurando event listeners del admin dashboard...');
    
    // Manejar clicks en las tarjetas de opciones con navegación SPA
    $('.tarjeta-opcion[data-spa-nav]').off('click').on('click', function() {
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
            case 'ver-usuarios':
                mensaje = 'Redirigiendo a la gestión de usuarios...';
                break;
            default:
                mensaje = `Redirigiendo a ${titulo}...`;
        }
        
        mostrarToastAdmin(mensaje, 'info');
        
        // Navegar con SPA
        setTimeout(() => {
            if (window.spaNav) {
                window.spaNav.navigateTo(destino);
            } else {
                // Fallback a navegación tradicional
                window.location.href = destino + '.html';
            }
        }, 1000);
    });
    
    // Manejar clicks en las tarjetas de opciones SIN data-spa-nav (para compatibilidad)
    $('.tarjeta-opcion:not([data-spa-nav])').off('click').on('click', function() {
        const $tarjeta = $(this);
        const titulo = $tarjeta.find('.titulo-opcion').text().trim();
        
        // Efecto visual
        $tarjeta.addClass('seleccionada');
        setTimeout(() => $tarjeta.removeClass('seleccionada'), 200);
        
        // Redirigir según la opción
        switch(titulo) {
            case 'Explorar reportes':
                mostrarToastAdmin('Redirigiendo a la gestión de reportes...', 'info');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('explorar-reportes');
                    } else {
                        window.location.href = 'explorar-reportes.html';
                    }
                }, 1000);
                break;
                
            case 'Crear un nuevo reporte':
                mostrarToastAdmin('Redirigiendo al formulario de reportes...', 'info');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('crear-reporte');
                    } else {
                        window.location.href = 'crear-reporte.html';
                    }
                }, 1000);
                break;
                
            case 'Crear nuevo usuario':
                mostrarToastAdmin('Redirigiendo al formulario de usuarios...', 'admin');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('crear-usuario');
                    } else {
                        window.location.href = 'crear-usuario.html';
                    }
                }, 1000);
                break;
                
            case 'Ver usuarios':
                mostrarToastAdmin('Redirigiendo a la gestión de usuarios...', 'info');
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('ver-usuarios');
                    } else {
                        window.location.href = 'ver-usuarios.html';
                    }
                }, 1000);
                break;
        }
    });
    
    // Manejar clicks en botones principales
    $('.boton-principal').off('click').on('click', function(e) {
        e.stopPropagation();
        const $boton = $(this);
        
        $boton.addClass('presionado');
        setTimeout(() => $boton.removeClass('presionado'), 150);
        
        mostrarToastAdmin('Redirigiendo al formulario de reportes...', 'success');
    });
    
    $('.boton-secundario').off('click').on('click', function(e) {
        e.stopPropagation();
        const $boton = $(this);
        
        $boton.addClass('presionado');
        setTimeout(() => $boton.removeClass('presionado'), 150);
        
        mostrarToastAdmin('Redirigiendo al formulario de usuarios...', 'admin');
    });
    
    // Efectos hover para las tarjetas de estadísticas
    $('.tarjeta-estadistica').off('mouseenter mouseleave').on('mouseenter', function() {
        $(this).find('.numero-estadistica').css('transform', 'scale(1.1)');
    }).on('mouseleave', function() {
        $(this).find('.numero-estadistica').css('transform', 'scale(1)');
    });
}

// ===========================
// FUNCIONES AUXILIARES
// ===========================

/**
 * Función para mostrar toasts
 */
function mostrarToastAdmin(mensaje, tipo = 'info') {
    // Si existe la función global mostrarToast, usarla
    if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(mensaje, tipo);
        return;
    }
    
    // Fallback: crear toast manualmente
    const toast = $(`
        <div class="toast toast-${tipo}">
            <span class="material-symbols-outlined">
                ${getTipoIconAdmin(tipo)}
            </span>
            <span>${mensaje}</span>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(() => toast.addClass('mostrar'), 100);
    
    setTimeout(() => {
        toast.removeClass('mostrar');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Función para obtener el icono según el tipo
 */
function getTipoIconAdmin(tipo) {
    switch(tipo) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'admin': return 'admin_panel_settings';
        default: return 'info';
    }
}

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
        window.location.href = 'explorar-reportes.html';
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
