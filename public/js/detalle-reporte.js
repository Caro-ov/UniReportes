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

    // Prevenir que el menú se cierre al hacer clic dentro
    $('.menu-desplegable').click(function(e) {
        e.stopPropagation();
    });

    // ===========================
    // FUNCIONALIDAD DE DETALLE-REPORTE
    // ===========================
    
    // Función para cargar los detalles del reporte
    async function cargarDetalleReporte(reportId) {
        try {
            console.log(`🔄 Cargando detalles del reporte ${reportId}...`);
            const response = await fetch(`/api/reports/${reportId}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📋 Detalles del reporte recibidos:', data);
            
            if (data.success && data.data) {
                mostrarDetalleReporte(data.data);
            } else {
                throw new Error('Estructura de respuesta incorrecta');
            }
            
        } catch (error) {
            console.error('❌ Error cargando detalles del reporte:', error);
            mostrarError('No se pudieron cargar los detalles del reporte');
        }
    }
    
    // Función para mostrar los detalles del reporte en la página
    function mostrarDetalleReporte(reporte) {
        console.log('📋 Mostrando detalles del reporte:', reporte);
        
        try {
            // Actualizar breadcrumb
            const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
            const breadcrumbLink = document.querySelector('.breadcrumb-link');
            
            if (breadcrumbCurrent) {
                breadcrumbCurrent.textContent = `Reporte #${reporte.id_reporte}`;
            }
            
            if (breadcrumbLink) {
                // Hacer el breadcrumb funcional para navegación SPA
                breadcrumbLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.spaNav) {
                        window.spaNav.navigateTo('mis-reportes');
                    } else {
                        window.location.href = '/mis-reportes.html';
                    }
                });
            }
            
            // Actualizar título del reporte
            const tituloReporte = document.querySelector('.titulo-reporte');
            if (tituloReporte) {
                tituloReporte.textContent = reporte.titulo || 'Sin título';
            }
            
            // Actualizar número del reporte
            const numeroReporte = document.querySelector('.numero-reporte');
            if (numeroReporte) {
                numeroReporte.textContent = `Reporte #${reporte.id_reporte}`;
            }
            
            // Actualizar estado
            const estadoContainer = document.querySelector('.estado-container .estado');
            if (estadoContainer) {
                estadoContainer.textContent = reporte.estado || 'Sin estado';
                estadoContainer.className = `estado estado-${obtenerClaseEstado(reporte.estado)}`;
            }
            
            // Actualizar detalles específicos (necesitarás adaptar según tu estructura HTML)
            actualizarDetallesReporte(reporte);
            
        } catch (error) {
            console.error('❌ Error mostrando detalles del reporte:', error);
        }
    }
    
    // Función auxiliar para actualizar detalles específicos del reporte
    function actualizarDetallesReporte(reporte) {
        // Aquí puedes agregar la lógica específica para actualizar todos los campos
        // según la estructura de tu HTML de detalle-reporte.html
        
        // Ejemplo: actualizar descripción, fecha, ubicación, etc.
        const elementos = {
            descripcion: document.querySelector('.descripcion-reporte'),
            fecha: document.querySelector('.fecha-reporte'),
            ubicacion: document.querySelector('.ubicacion-reporte'),
            categoria: document.querySelector('.categoria-reporte'),
            usuario: document.querySelector('.usuario-reporte')
        };
        
        if (elementos.descripcion) {
            elementos.descripcion.textContent = reporte.descripcion || 'Sin descripción';
        }
        
        if (elementos.fecha) {
            elementos.fecha.textContent = formatearFecha(reporte.fecha_creacion);
        }
        
        if (elementos.ubicacion) {
            elementos.ubicacion.textContent = reporte.ubicacion || 'Sin ubicación';
        }
        
        if (elementos.categoria) {
            elementos.categoria.textContent = reporte.categoria || 'Sin categoría';
        }
        
        if (elementos.usuario) {
            elementos.usuario.textContent = reporte.usuario_nombre || 'Usuario desconocido';
        }
    }
    
    // Función auxiliar para obtener la clase CSS del estado
    function obtenerClaseEstado(estado) {
        const estadosClases = {
            'pendiente': 'enviado',
            'en revision': 'revisado',
            'en proceso': 'proceso',
            'resuelto': 'resuelto',
            'cerrado': 'resuelto'
        };
        return estadosClases[estado?.toLowerCase()] || 'enviado';
    }
    
    // Función auxiliar para formatear fechas
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Función para mostrar errores
    function mostrarError(mensaje) {
        console.error('❌', mensaje);
        
        // Mostrar mensaje de error en la página
        const contenedorContenido = document.querySelector('.contenedor-contenido');
        if (contenedorContenido) {
            contenedorContenido.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 2rem; color: #666;">
                    <span class="material-symbols-outlined" style="font-size: 3rem; color: #e74c3c;">error</span>
                    <h3>Error al cargar el reporte</h3>
                    <p>${mensaje}</p>
                    <button onclick="
                        if (window.spaNav) { 
                            window.spaNav.navigateTo('mis-reportes'); 
                        } else { 
                            history.back(); 
                        }
                    " class="btn-secundario">Volver</button>
                </div>
            `;
        }
    }
    
    // Función para obtener el ID del reporte desde la URL
    function obtenerIdReporte() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    // Inicialización automática
    console.log('🚀 Inicializando página Detalle Reporte...');
    
    const reportId = obtenerIdReporte();
    if (reportId) {
        cargarDetalleReporte(reportId);
    } else {
        mostrarError('No se especificó un ID de reporte válido');
    }
    
    // Función global para recargar datos (llamada por SPA navigation)
    window.manejarDetalleReporte = function(reportId) {
        console.log(`🔄 SPA: Cargando detalle del reporte ${reportId}...`);
        
        // Pequeño retraso para la navegación SPA
        setTimeout(() => {
            if (reportId) {
                cargarDetalleReporte(reportId);
            } else {
                mostrarError('No se especificó un ID de reporte válido');
            }
        }, 150);
    };
    
    // Alias para compatibilidad
    window.recargarDetalleReporte = window.manejarDetalleReporte;
});