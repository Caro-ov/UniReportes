$(document).ready(function() {
    // Admin-specific detail script that reuses functions from detalle-reporte-common.js
    // Indicar página de retorno para el helper común
    window.DETALLE_BACK_PAGE = 'explorar-reportes';

    let reporteActual = null;

    // Evitar duplicar el dropdown si ya está inicializado por components.js
    $(document).off('click.adminAvatar').on('click.adminAvatar', '.avatar-usuario', function(e) {
        e.stopPropagation();
        $('.menu-desplegable').toggleClass('mostrar');
    });

    $(document).off('click.adminDoc').on('click.adminDoc', function() {
        $('.menu-desplegable').removeClass('mostrar');
    });

    $(document).off('click.adminMenu').on('click.adminMenu', '.menu-desplegable', function(e) {
        // Permitir que clicks en opciones críticas (p.ej. logout) propaguen
        if ($(e.target).closest('.logout-btn, .cerrar-sesion').length) {
            return; // no detener propagación para que el handler global la reciba
        }
        // Para otros clicks dentro del menú, evitar que cierren el dropdown
        e.stopPropagation();
    });

    // Cargar detalle (admin)
    async function cargarDetalleReporte(reportId) {
        try {
            console.log(`🔄 [ADMIN] Cargando detalles del reporte ${reportId}...`);
            window.mostrarCarga(true);

            const response = await fetch(`/api/reports/${reportId}`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 404) throw new Error('Reporte no encontrado');
                if (response.status === 403) throw new Error('No tienes permisos para ver este reporte');
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success && data.data) {
                reporteActual = data.data;
                await mostrarDetalleReporte(data.data);
                // Estas funciones pueden permanecer aquí (cargar archivos/historial/comentarios)
                await cargarArchivosReporte(reportId);
                await cargarHistorialReporte(reportId);
                await window.cargarComentariosReporte(reportId);
                await window.cargarDatosUsuarioEnFormulario();
            } else {
                throw new Error('Estructura de respuesta incorrecta');
            }
        } catch (error) {
            console.error('❌ Error cargando detalles del reporte (admin):', error);
            window.mostrarErrorDetalle(error.message || 'No se pudieron cargar los detalles del reporte');
        } finally {
            window.mostrarCarga(false);
        }
    }

    async function mostrarDetalleReporte(reporte) {
        try {
            $('.breadcrumb-current').text(`Reporte #${reporte.id_reporte}`);
            $('.breadcrumb-link').off('click').on('click', function(e) {
                e.preventDefault();
                
                // Marcar múltiples formas que los reportes necesitan actualización
                if (window.sessionStorage) {
                    sessionStorage.setItem('reportes_actualizados', 'true');
                    sessionStorage.setItem('ultimo_cambio_estado', Date.now().toString());
                }
                
                // Disparar evento antes de navegar
                window.dispatchEvent(new CustomEvent('reporteActualizado', { 
                    detail: { 
                        reporteId: reporteActual?.id_reporte || 'desconocido', 
                        accion: 'navegacion_vuelta' 
                    } 
                }));
                
                // Navegar
                if (window.spaNav) {
                    window.spaNav.navigateTo('explorar-reportes');
                } else if (window.spaNavigation) {
                    window.spaNavigation.navigate('/explorar-reportes.html');
                } else {
                    window.location.href = '/explorar-reportes.html';
                }
            });

            $('.titulo-reporte').text(reporte.titulo || 'Sin título');
            $('.numero-reporte').text(`Reporte #${reporte.id_reporte}`);

            const estadoElement = $('.estado-container .estado');
            if (estadoElement.length) {
                estadoElement.text(reporte.estado || 'Pendiente');
                estadoElement.attr('class', `estado estado-${window.obtenerClaseEstado(reporte.estado)}`);
            }

            actualizarDetallesReporte(reporte);
        } catch (err) {
            console.error('❌ Error mostrando detalles (admin):', err);
        }
    }

    function actualizarDetallesReporte(reporte) {
        const detallesGrid = $('.detalles-grid'); if (detallesGrid.length === 0) return;
        detallesGrid.empty();
        const ubicacion = reporte.ubicacion_nombre && reporte.salon_nombre ? `${reporte.salon_nombre}, ${reporte.ubicacion_nombre}` : reporte.salon_nombre || reporte.ubicacion_nombre || 'No especificada';
        detallesGrid.append(`
            <div class="detalle-item">
                <p class="detalle-label">Ubicación</p>
                <p class="detalle-valor">${window.escapeHtml(ubicacion)}</p>
            </div>
        `);
        if (reporte.categoria_nombre) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Categoría</p>
                    <p class="detalle-valor">${window.escapeHtml(reporte.categoria_nombre)}</p>
                </div>
            `);
        }
        if (reporte.fecha_reporte) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Fecha del incidente</p>
                    <p class="detalle-valor">${window.formatearFecha(reporte.fecha_reporte)}</p>
                </div>
            `);
        }
        detallesGrid.append(`
            <div class="detalle-item">
                <p class="detalle-label">Fecha de envío</p>
                <p class="detalle-valor">${window.formatearFecha(reporte.fecha_creacion)}</p>
            </div>
        `);
        if (reporte.usuario_nombre) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Reportado por</p>
                    <p class="detalle-valor">${window.escapeHtml(reporte.usuario_nombre)}</p>
                </div>
            `);
        }
        detallesGrid.append(`
            <div class="detalle-item detalle-descripcion">
                <p class="detalle-label">Descripción</p>
                <p class="detalle-valor descripcion-texto">${window.escapeHtml(reporte.descripcion || 'Sin descripción').replace(/\n/g, '<br>')}</p>
            </div>
        `);
    }

    // Cargar archivos e historial (mantener implementación local)
    async function cargarArchivosReporte(reportId) {
        try {
            const response = await fetch(`/api/files/report/${reportId}`, { credentials: 'include' });
            if (!response.ok) { console.log('ℹ️ No se pudieron cargar archivos (admin):', response.status); return; }
            const data = await response.json(); if (data.success && data.data) mostrarArchivos(data.data);
        } catch (error) { console.error('❌ Error cargando archivos (admin):', error); }
    }

    function mostrarArchivos(archivos) {
        const archivosSection = $('.archivos-section'); if (!archivos || archivos.length === 0) { archivosSection.hide(); return; }
        const archivosGrid = $('.archivos-grid'); archivosGrid.empty();
        archivos.forEach(archivo => {
            let contenidoArchivo = '';
            if (archivo.isImage) {
                contenidoArchivo = `
                    <div class="archivo-item imagen-item" data-archivo-id="${archivo.id_archivo}">
                        <div class="archivo-icono imagen"><span class="material-symbols-outlined">image</span></div>
                        <div class="archivo-info"><div class="archivo-nombre">${window.escapeHtml(archivo.filename)}</div><div class="archivo-meta">Imagen • ${window.formatearTamaño(archivo.tamano)}</div></div>
                        <div class="archivo-acciones">
                            <button class="btn-ver-archivo" onclick="verArchivo('${archivo.fileUrl}', '${archivo.filename}', 'imagen')" title="Ver imagen"><span class="material-symbols-outlined">visibility</span></button>
                            <button class="btn-descargar-archivo" onclick="descargarArchivo('${archivo.fileUrl}', '${archivo.filename}')" title="Descargar"><span class="material-symbols-outlined">download</span></button>
                        </div>
                    </div>
                `;
            } else if (archivo.isVideo) {
                contenidoArchivo = `
                    <div class="archivo-item video-item" data-archivo-id="${archivo.id_archivo}">
                        <div class="archivo-icono video"><span class="material-symbols-outlined">videocam</span></div>
                        <div class="archivo-info"><div class="archivo-nombre">${window.escapeHtml(archivo.filename)}</div><div class="archivo-meta">Video • ${window.formatearTamaño(archivo.tamano)}</div></div>
                        <div class="archivo-acciones">
                            <button class="btn-ver-archivo video" onclick="verArchivo('${archivo.fileUrl}', '${archivo.filename}', 'video')" title="Reproducir video"><span class="material-symbols-outlined">play_arrow</span></button>
                            <button class="btn-descargar-archivo" onclick="descargarArchivo('${archivo.fileUrl}', '${archivo.filename}')" title="Descargar"><span class="material-symbols-outlined">download</span></button>
                        </div>
                    </div>
                `;
            }
            if (contenidoArchivo) archivosGrid.append(contenidoArchivo);
        });
        archivosSection.show();
    }

    async function cargarHistorialReporte(reportId) {
        try {
            const response = await fetch(`/api/reports/${reportId}/historial`, { credentials: 'include' });
            if (!response.ok) { console.log('ℹ️ No se pudo cargar historial (admin):', response.status); return; }
            const data = await response.json(); if (data.success && data.data) mostrarHistorial(data.data);
        } catch (error) { console.error('❌ Error cargando historial (admin):', error); }
    }

    function mostrarHistorial(historial) {
        const timeline = $('.timeline'); timeline.empty();
        
        // Siempre mostrar el evento inicial de "Reporte enviado"
        timeline.append(`<div class="timeline-item"><div class="timeline-icon"><span class="material-symbols-outlined">send</span></div><div class="timeline-content"><p class="timeline-titulo">Reporte enviado</p><p class="timeline-fecha">${window.formatearFecha(reporteActual?.fecha_creacion)}</p></div></div>`);
        
        // Luego mostrar el resto del historial si existe
        if (historial && historial.length > 0) {
            historial.forEach(evento => {
                const icono = window.obtenerIconoHistorial(evento.tipo);
                const titulo = window.obtenerTituloHistorial(evento.tipo, evento);
                timeline.append(`<div class="timeline-item"><div class="timeline-icon"><span class="material-symbols-outlined">${icono}</span></div><div class="timeline-content"><p class="timeline-titulo">${titulo}</p><p class="timeline-fecha">${window.formatearFecha(evento.fecha)}</p>${evento.descripcion ? `<p class="timeline-descripcion">${window.escapeHtml(evento.descripcion)}</p>` : ''}</div></div>`);
            });
        }
    }

    // ========================================
    // GESTIÓN DE ESTADO (ADMIN)
    // ========================================

    // Cargar estados disponibles
    async function cargarEstadosDisponibles() {
        try {
            const response = await fetch('/api/categories/states', { credentials: 'include' });
            if (!response.ok) throw new Error('Error al cargar estados');
            
            const data = await response.json();
            if (data.success && data.data) {
                const select = $('#nuevo-estado');
                select.empty().append('<option value="">Seleccionar nuevo estado...</option>');
                
                data.data.forEach(estado => {
                    const valorEstado = estado.nombre.toLowerCase();
                    const textoEstado = estado.nombre; // Ya está capitalizado desde la BD
                    select.append(`<option value="${valorEstado}">${textoEstado}</option>`);
                });
            }
        } catch (error) {
            console.error('❌ Error cargando estados:', error);
        }
    }

    // Actualizar estado del reporte
    async function actualizarEstadoReporte() {
        if (!reporteActual) {
            window.mostrarToast?.('No hay reporte cargado', 'error');
            return;
        }

        const nuevoEstado = $('#nuevo-estado').val();
        console.log('🔍 Estado seleccionado:', { nuevoEstado, reporteActual });
        
        if (!nuevoEstado) {
            window.mostrarToast?.('Selecciona un nuevo estado', 'warning');
            return;
        }

        const estadoActual = reporteActual.estado;
        if (nuevoEstado === estadoActual) {
            window.mostrarToast?.('El reporte ya tiene ese estado', 'warning');
            return;
        }

        const btnActualizar = $('.btn-actualizar-estado');
        const textoOriginal = btnActualizar.html();
        
        try {
            // Mostrar estado de carga
            btnActualizar.prop('disabled', true).html('<span class="material-symbols-outlined">sync</span>Actualizando...');
            
            console.log('🚀 Enviando solicitud de cambio de estado:', { 
                reportId: reporteActual.id_reporte, 
                estado: nuevoEstado 
            });
            
            const response = await fetch(`/api/reports/${reporteActual.id_reporte}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ estado: nuevoEstado })
            });

            console.log('📡 Respuesta del servidor:', { status: response.status, ok: response.ok });
            
            const data = await response.json();
            console.log('📄 Datos de respuesta:', data);
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al actualizar estado');
            }

            // Actualizar estado en la interfaz
            reporteActual.estado = nuevoEstado;
            actualizarEstadoEnInterfaz(nuevoEstado);
            
            // Limpiar selección
            $('#nuevo-estado').val('');
            
            // Recargar historial para mostrar el cambio
            await cargarHistorialReporte(reporteActual.id_reporte);
            
            // Forzar actualización de reportes usando múltiples métodos
            if (window.sessionStorage) {
                sessionStorage.setItem('reportes_actualizados', 'true');
                sessionStorage.setItem('ultimo_cambio_estado', Date.now().toString());
            }
            
            // Disparar evento personalizado para notificar cambios
            window.dispatchEvent(new CustomEvent('reporteActualizado', { 
                detail: { 
                    reporteId: reporteActual.id_reporte, 
                    nuevoEstado: nuevoEstado 
                } 
            }));
            
            // Si hay una función global para recargar, usarla
            if (window.recargarReportes && typeof window.recargarReportes === 'function') {
                console.log('🔄 Forzando recarga inmediata de reportes...');
                setTimeout(() => window.recargarReportes(), 100);
            }
            
            window.mostrarToast?.(`Estado actualizado a "${window.capitalizarPrimeraLetra(nuevoEstado.replace('_', ' '))}"`, 'success');
            
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            window.mostrarToast?.(error.message || 'Error al actualizar estado', 'error');
        } finally {
            // Restaurar botón
            btnActualizar.prop('disabled', false).html(textoOriginal);
        }
    }

    // Actualizar estado en la interfaz
    function actualizarEstadoEnInterfaz(nuevoEstado) {
        const estadoDisplay = $('#estado-actual-display');
        const estadoContainer = $('.estado-container .estado');
        const estadoTexto = window.capitalizarPrimeraLetra(nuevoEstado.replace('_', ' '));
        
        // Actualizar display del estado actual
        if (estadoDisplay.length) {
            estadoDisplay.text(estadoTexto)
                         .attr('class', `estado estado-${window.obtenerClaseEstado(nuevoEstado)}`);
        }
        
        // Actualizar estado en header si existe
        if (estadoContainer.length) {
            estadoContainer.text(estadoTexto)
                          .attr('class', `estado estado-${window.obtenerClaseEstado(nuevoEstado)}`);
        }
    }

    // Funciones globales
    window.actualizarEstadoReporte = actualizarEstadoReporte;

    // Funciones auxiliares si no existen
    if (!window.capitalizarPrimeraLetra) {
        window.capitalizarPrimeraLetra = function(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };
    }

    if (!window.obtenerClaseEstado) {
        window.obtenerClaseEstado = function(estado) {
            const estadosMap = {
                'pendiente': 'pendiente',
                'revisado': 'revisado', 
                'en proceso': 'en-proceso',
                'en_proceso': 'en-proceso',
                'resuelto': 'resuelto',
                'cerrado': 'resuelto'
            };
            return estadosMap[estado] || 'pendiente';
        };
    }

    // Modificar la función cargarDetalleReporte para incluir carga de estados
    const originalCargarDetalle = cargarDetalleReporte;
    cargarDetalleReporte = async function(reportId) {
        await originalCargarDetalle(reportId);
        if (reporteActual) {
            await cargarEstadosDisponibles();
            actualizarEstadoEnInterfaz(reporteActual.estado);
        }
    };

    // Inicialización (Admin)
    console.log('🚀 Inicializando página Detalle Reporte (Admin)...');
    const reportId = window.obtenerIdReporte ? window.obtenerIdReporte() : (new URLSearchParams(window.location.search)).get('id');
    if (reportId) { cargarDetalleReporte(reportId); } else { window.mostrarCarga(false); window.mostrarErrorDetalle('No se especificó un ID de reporte válido'); }

    // Funciones globales para SPA
    window.manejarDetalleReporteAdmin = function(paramOrId) {
        console.log('🔄 SPA [ADMIN]: manejarDetalleReporteAdmin llamado con:', paramOrId);
        try {
            let reportId = null;
            if (!paramOrId) {
                // Intentar obtener de la URL actual
                reportId = window.obtenerIdReporte ? window.obtenerIdReporte() : (new URLSearchParams(window.location.search)).get('id');
            } else if (typeof paramOrId === 'string') {
                // Si es una query string como '?id=123' o 'id=123', parsearla
                if (paramOrId.includes('id=')) {
                    const params = new URLSearchParams(paramOrId.startsWith('?') ? paramOrId : ('?' + paramOrId));
                    reportId = params.get('id');
                } else {
                    // Podría ser el ID directo en formato string
                    reportId = paramOrId;
                }
            } else if (typeof paramOrId === 'number') {
                reportId = String(paramOrId);
            }

            if (reportId) {
                cargarDetalleReporte(reportId);
            } else {
                window.mostrarErrorDetalle('No se especificó un ID de reporte válido');
            }

            setTimeout(() => { window.cargarDatosUsuarioEnFormulario && window.cargarDatosUsuarioEnFormulario(); }, 100);
        } catch (err) {
            console.error('Error en manejarDetalleReporteAdmin:', err);
            window.mostrarErrorDetalle('Error al procesar el ID del reporte');
        }
    };
    window.recargarDetalleReporteAdmin = window.manejarDetalleReporteAdmin;

    window.inicializarDetalleReporteAdmin = function() {
        console.log('🔄 Reinicializando página de detalle reporte (admin)...');
        const reportId = window.obtenerIdReporte ? window.obtenerIdReporte() : (new URLSearchParams(window.location.search)).get('id');
        if (reportId) cargarDetalleReporte(reportId);
        window.cargarDatosUsuarioEnFormulario && window.cargarDatosUsuarioEnFormulario();
        const textarea = document.getElementById('nuevo-comentario');
        if (textarea) {
            textarea.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
            textarea.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); window.enviarComentario && window.enviarComentario(); } });
        }
    };

});
