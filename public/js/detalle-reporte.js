$(document).ready(function() {
    // ===========================
    // VARIABLES GLOBALES
    // ===========================
    let reporteActual = null;

    // ===========================
    // FUNCIONES UTILITARIAS
    // ===========================
    
    // Función para formatear el tamaño de archivos
    function formatearTamaño(bytes) {
        if (!bytes) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ===========================
    // DROPDOWN DEL PERFIL
    // ===========================
    // ===== Dropdown del perfil (usar delegación y namespace para evitar conflictos con components.js)
    // Delegar el toggle del avatar en el documento y usar namespace para permitir limpieza segura
    $(document).off('click.detalleAvatar').on('click.detalleAvatar', '.avatar-usuario', function(e) {
        e.stopPropagation();
        $('.menu-desplegable').toggleClass('mostrar');
    });

    // Cerrar menú al hacer clic fuera (namespaced)
    $(document).off('click.detalleDoc').on('click.detalleDoc', function() {
        $('.menu-desplegable').removeClass('mostrar');
    });

    // No detener la propagación dentro del menú para permitir que los handlers globales
    // (por ejemplo el de logout en components.js) reciban el evento delegado.
    $(document).off('click.detalleMenu').on('click.detalleMenu', '.menu-desplegable', function(e) {
        // Intencionalmente NO se llama a e.stopPropagation() aquí.
        // Se puede usar para manejo específico interno si se necesita más adelante.
    });

    // ===========================
    // FUNCIONALIDAD PRINCIPAL
    // ===========================
    
    // Función para cargar los detalles del reporte
    async function cargarDetalleReporte(reportId) {
        try {
            console.log(`🔄 Cargando detalles del reporte ${reportId}...`);
            
            mostrarCarga(true);
            
            const response = await fetch(`/api/reports/${reportId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Reporte no encontrado');
                } else if (response.status === 403) {
                    throw new Error('No tienes permisos para ver este reporte');
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            console.log('📋 Detalles del reporte recibidos:', data);
            
            if (data.success && data.data) {
                reporteActual = data.data;
                await mostrarDetalleReporte(data.data);
                await cargarArchivosReporte(reportId);
                await cargarHistorialReporte(reportId);
                await cargarComentariosReporte(reportId);
                
                // Cargar datos del usuario en el formulario
                cargarDatosUsuarioEnFormulario();
            } else {
                throw new Error('Estructura de respuesta incorrecta');
            }
            
        } catch (error) {
            console.error('❌ Error cargando detalles del reporte:', error);
            mostrarError(error.message || 'No se pudieron cargar los detalles del reporte');
        } finally {
            mostrarCarga(false);
        }
    }
    
    // Función para mostrar los detalles del reporte en la página
    async function mostrarDetalleReporte(reporte) {
        console.log('📋 Mostrando detalles del reporte:', reporte);
        
        try {
            // Actualizar breadcrumb
            $('.breadcrumb-current').text(`Reporte #${reporte.id_reporte}`);
            
            // Hacer el breadcrumb funcional
            $('.breadcrumb-link').off('click').on('click', function(e) {
                e.preventDefault();
                if (window.spaNav) {
                    window.spaNav.navigateTo('mis-reportes');
                } else {
                    window.location.href = '/mis-reportes.html';
                }
            });
            
            // Actualizar información principal
            $('.titulo-reporte').text(reporte.titulo || 'Sin título');
            $('.numero-reporte').text(`Reporte #${reporte.id_reporte}`);
            
            // Actualizar estado
            const estadoElement = $('.estado-container .estado');
            if (estadoElement.length) {
                estadoElement.text(reporte.estado || 'Pendiente');
                estadoElement.attr('class', `estado estado-${obtenerClaseEstado(reporte.estado)}`);
            }
            
            // Actualizar detalles del reporte
            actualizarDetallesReporte(reporte);
            
        } catch (error) {
            console.error('❌ Error mostrando detalles del reporte:', error);
        }
    }
    
    // Función para actualizar los detalles específicos del reporte
    function actualizarDetallesReporte(reporte) {
        const detallesGrid = $('.detalles-grid');
        if (detallesGrid.length === 0) return;
        
        // Limpiar contenido existente
        detallesGrid.empty();
        
        // Ubicación
        const ubicacion = reporte.ubicacion_nombre && reporte.salon_nombre 
            ? `${reporte.salon_nombre}, ${reporte.ubicacion_nombre}`
            : reporte.salon_nombre || reporte.ubicacion_nombre || 'No especificada';
            
        detallesGrid.append(`
            <div class="detalle-item">
                <p class="detalle-label">Ubicación</p>
                <p class="detalle-valor">${escapeHtml(ubicacion)}</p>
            </div>
        `);
        
        // Categoría
        if (reporte.categoria_nombre) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Categoría</p>
                    <p class="detalle-valor">${escapeHtml(reporte.categoria_nombre)}</p>
                </div>
            `);
        }
        
        // Fecha de reporte
        if (reporte.fecha_reporte) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Fecha del incidente</p>
                    <p class="detalle-valor">${formatearFecha(reporte.fecha_reporte)}</p>
                </div>
            `);
        }
        
        // Fecha de envío
        detallesGrid.append(`
            <div class="detalle-item">
                <p class="detalle-label">Fecha de envío</p>
                <p class="detalle-valor">${formatearFecha(reporte.fecha_creacion)}</p>
            </div>
        `);
        
        // Reportado por
        if (reporte.usuario_nombre) {
            detallesGrid.append(`
                <div class="detalle-item">
                    <p class="detalle-label">Reportado por</p>
                    <p class="detalle-valor">${escapeHtml(reporte.usuario_nombre)}</p>
                </div>
            `);
        }
        
        // Descripción (elemento completo)
        detallesGrid.append(`
            <div class="detalle-item detalle-descripcion">
                <p class="detalle-label">Descripción</p>
                <p class="detalle-valor descripcion-texto">${escapeHtml(reporte.descripcion || 'Sin descripción').replace(/\n/g, '<br>')}</p>
            </div>
        `);
    }
    
    // Función para cargar archivos del reporte
    async function cargarArchivosReporte(reportId) {
        try {
            console.log(`📁 Cargando archivos del reporte ${reportId}...`);
            
            const response = await fetch(`/api/files/report/${reportId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('ℹ️ No se pudieron cargar archivos:', response.status);
                return;
            }
            
            const data = await response.json();
            console.log('📁 Archivos recibidos:', data);
            
            if (data.success && data.data) {
                mostrarArchivos(data.data);
            }
            
        } catch (error) {
            console.error('❌ Error cargando archivos:', error);
        }
    }
    
    // Función para mostrar archivos
    function mostrarArchivos(archivos) {
        const archivosSection = $('.archivos-section');
        
        if (!archivos || archivos.length === 0) {
            archivosSection.hide();
            return;
        }
        
        const archivosGrid = $('.archivos-grid');
        archivosGrid.empty();
        
        archivos.forEach(archivo => {
            let contenidoArchivo;
            
            if (archivo.isImage) {
                contenidoArchivo = `
                    <div class="archivo-item imagen-item" data-archivo-id="${archivo.id_archivo}">
                        <div class="archivo-icono imagen">
                            <span class="material-symbols-outlined">image</span>
                        </div>
                        <div class="archivo-info">
                            <div class="archivo-nombre">${escapeHtml(archivo.filename)}</div>
                            <div class="archivo-meta">Imagen • ${formatearTamaño(archivo.tamano)} • Subido hace 2 horas</div>
                        </div>
                        <div class="archivo-acciones">
                            <button class="btn-ver-archivo" onclick="verArchivo('${archivo.fileUrl}', '${archivo.filename}', 'imagen')" title="Ver imagen">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                            <button class="btn-descargar-archivo" onclick="descargarArchivo('${archivo.fileUrl}', '${archivo.filename}')" title="Descargar">
                                <span class="material-symbols-outlined">download</span>
                            </button>
                        </div>
                    </div>
                `;
            } else if (archivo.isVideo) {
                contenidoArchivo = `
                    <div class="archivo-item video-item" data-archivo-id="${archivo.id_archivo}">
                        <div class="archivo-icono video">
                            <span class="material-symbols-outlined">videocam</span>
                        </div>
                        <div class="archivo-info">
                            <div class="archivo-nombre">${escapeHtml(archivo.filename)}</div>
                            <div class="archivo-meta">Video • ${formatearTamaño(archivo.tamano)} • Subido hace 1 hora</div>
                        </div>
                        <div class="archivo-acciones">
                            <button class="btn-ver-archivo video" onclick="verArchivo('${archivo.fileUrl}', '${archivo.filename}', 'video')" title="Reproducir video">
                                <span class="material-symbols-outlined">play_arrow</span>
                            </button>
                            <button class="btn-descargar-archivo" onclick="descargarArchivo('${archivo.fileUrl}', '${archivo.filename}')" title="Descargar">
                                <span class="material-symbols-outlined">download</span>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            if (contenidoArchivo) {
                archivosGrid.append(contenidoArchivo);
            }
        });
        
        archivosSection.show();
    }
    
    // Función para cargar historial de cambios
    async function cargarHistorialReporte(reportId) {
        try {
            console.log(`📜 Cargando historial del reporte ${reportId}...`);
            
            const response = await fetch(`/api/reports/${reportId}/historial`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.log('ℹ️ No se pudo cargar historial:', response.status);
                return;
            }
            
            const data = await response.json();
            console.log('📜 Historial recibido:', data);
            
            if (data.success && data.data) {
                mostrarHistorial(data.data);
            }
            
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
        }
    }
    
    // Función para mostrar historial
    function mostrarHistorial(historial) {
        const timeline = $('.timeline');
        timeline.empty();
        
        if (!historial || historial.length === 0) {
            // Mostrar al menos el evento de creación
            timeline.append(`
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <span class="material-symbols-outlined">send</span>
                    </div>
                    <div class="timeline-content">
                        <p class="timeline-titulo">Reporte enviado</p>
                        <p class="timeline-fecha">${formatearFecha(reporteActual?.fecha_creacion)}</p>
                    </div>
                </div>
            `);
            return;
        }
        
        historial.forEach(evento => {
            const icono = obtenerIconoHistorial(evento.tipo);
            const titulo = obtenerTituloHistorial(evento.tipo, evento);
            
            timeline.append(`
                <div class="timeline-item">
                    <div class="timeline-icon">
                        <span class="material-symbols-outlined">${icono}</span>
                    </div>
                    <div class="timeline-content">
                        <p class="timeline-titulo">${titulo}</p>
                        <p class="timeline-fecha">${formatearFecha(evento.fecha)}</p>
                        ${evento.descripcion ? `<p class="timeline-descripcion">${escapeHtml(evento.descripcion)}</p>` : ''}
                    </div>
                </div>
            `);
        });
    }
    
    // ===========================
    // FUNCIONES AUXILIARES
    // ===========================
    
    // Función auxiliar para obtener la clase CSS del estado
    function obtenerClaseEstado(estado) {
        const estadosClases = {
            'pendiente': 'enviado',
            'en revision': 'revisado', 
            'revisado': 'revisado',
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Función para obtener icono del historial
    function obtenerIconoHistorial(tipo) {
        const iconos = {
            'creacion': 'send',
            'cambio_estado': 'hourglass_top',
            'asignacion': 'person',
            'comentario': 'chat',
            'resolucion': 'check_circle',
            'cierre': 'lock'
        };
        return iconos[tipo] || 'info';
    }
    
    // Función para obtener título del historial
    function obtenerTituloHistorial(tipo, evento) {
        const titulos = {
            'creacion': 'Reporte enviado',
            'cambio_estado': `Estado cambiado a: ${evento.valor_nuevo || evento.estado_nuevo}`,
            'asignacion': 'Técnico asignado',
            'comentario': 'Comentario agregado',
            'resolucion': 'Reporte resuelto',
            'cierre': 'Reporte cerrado'
        };
        return titulos[tipo] || 'Actividad registrada';
    }
    
    // Función para mostrar indicador de carga
    function mostrarCarga(mostrar) {
        if (mostrar) {
            $('.contenedor-contenido').addClass('cargando');
            $('.tarjeta-reporte').css('opacity', '0.5');
        } else {
            $('.contenedor-contenido').removeClass('cargando');
            $('.tarjeta-reporte').css('opacity', '1');
        }
    }
    
    // Función para mostrar errores
    function mostrarError(mensaje) {
        console.error('❌', mensaje);
        
        const contenedorContenido = $('.contenedor-contenido');
        contenedorContenido.html(`
            <div class="error-container" style="text-align: center; padding: 3rem; color: #666;">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #e74c3c; margin-bottom: 1rem;">error</span>
                <h3 style="margin: 1rem 0; color: #333;">Error al cargar el reporte</h3>
                <p style="margin-bottom: 2rem; font-size: 1.1rem;">${escapeHtml(mensaje)}</p>
                <button onclick="
                    if (window.spaNav) { 
                        window.spaNav.navigateTo('mis-reportes'); 
                    } else { 
                        window.location.href = '/mis-reportes.html';
                    }
                " class="boton-secundario">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Volver a mis reportes
                </button>
            </div>
        `);
    }
    
    // Función para escapar HTML
    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // ===========================
    // FUNCIONES GLOBALES
    // ===========================
    
    // Función global para ver archivos
    window.verArchivo = function(url, filename, tipo) {
        console.log(`🔍 Abriendo archivo: ${filename}`);
        
        if (tipo === 'imagen') {
            // Crear modal para imagen
            const modal = $(`
                <div class="modal-archivo" style="
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.9); z-index: 10000; display: flex;
                    align-items: center; justify-content: center; padding: 2rem;
                ">
                    <div class="modal-content" style="
                        position: relative; max-width: 90%; max-height: 90%;
                        background: white; border-radius: 8px; overflow: hidden;
                    ">
                        <div class="modal-header" style="
                            padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6;
                            display: flex; justify-content: space-between; align-items: center;
                        ">
                            <h4 style="margin: 0; color: #333;">${escapeHtml(filename)}</h4>
                            <button class="cerrar-modal" style="
                                background: none; border: none; font-size: 1.5rem; cursor: pointer;
                                padding: 0.5rem; border-radius: 4px; color: #666;
                            ">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <img src="${url}" alt="${escapeHtml(filename)}" style="
                            max-width: 100%; max-height: 70vh; display: block; margin: 0 auto;
                        ">
                    </div>
                </div>
            `);
            
            $('body').append(modal);
            
            // Cerrar modal
            modal.find('.cerrar-modal').on('click', () => modal.remove());
            modal.on('click', function(e) {
                if (e.target === this) modal.remove();
            });
            
            // Cerrar con ESC
            $(document).on('keydown.modal', function(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    $(document).off('keydown.modal');
                }
            });
        } else {
            // Para videos, abrir en nueva pestaña
            window.open(url, '_blank');
        }
    };

    // Función global para descargar archivos
    window.descargarArchivo = function(url, filename) {
        console.log(`⬇️ Descargando archivo: ${filename}`);
        
        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Agregar al DOM, hacer clic y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Función para obtener el ID del reporte desde la URL
    function obtenerIdReporte() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    console.log('🚀 Inicializando página Detalle Reporte...');
    
    const reportId = obtenerIdReporte();
    if (reportId) {
        cargarDetalleReporte(reportId);
    } else {
        console.log('⚠️ No se encontró ID de reporte en la URL');
        mostrarCarga(false); // Asegurar que se oculte el indicador de carga
        mostrarError('No se especificó un ID de reporte válido');
    }
    
    // ===========================
    // FUNCIONES GLOBALES PARA SPA
    // ===========================
    
    // Función global para recargar datos (llamada por SPA navigation)
    window.manejarDetalleReporte = function(reportId) {
        console.log(`🔄 SPA: Cargando detalle del reporte ${reportId}...`);
        
        if (reportId) {
            cargarDetalleReporte(reportId);
        } else {
            mostrarError('No se especificó un ID de reporte válido');
        }
        
        // Asegurar que se carguen los datos del usuario en el formulario después de un pequeño delay
        setTimeout(() => {
            cargarDatosUsuarioEnFormulario();
        }, 100);
    };
    
    // Alias para compatibilidad
    window.recargarDetalleReporte = window.manejarDetalleReporte;
    
    // Función para cargar datos de prueba cuando no hay ID válido
    function cargarDatosPrueba() {
        console.log('🧪 Cargando datos de prueba...');
        
        // Mostrar indicador de carga
        mostrarCarga(true);
        
        setTimeout(() => {
            const reportePrueba = {
                id_reporte: 'TEST-001',
                titulo: 'Fuga de agua en laboratorio - DATOS DE PRUEBA',
                descripcion: 'Se detectó una fuga de agua en el laboratorio de química que está afectando el piso y puede dañar los equipos. La fuga parece provenir de una tubería del sistema de lavado.',
                estado: 'pendiente',
                prioridad: 'alta',
                fecha_reporte: '2025-11-05T14:30:00.000Z', // Fecha del incidente
                fecha_creacion: new Date().toISOString(), // Fecha de envío del reporte
                fecha_actualizacion: new Date().toISOString(),
                // Campos que espera la función actualizarDetallesReporte
                usuario_nombre: 'Usuario de Prueba',
                usuario_correo: 'prueba@uni.local',
                categoria_nombre: 'Infraestructura',
                objeto_nombre: 'Sistema de tuberías',
                ubicacion_nombre: 'Edificio de Ciencias',
                salon_nombre: 'Lab-201',
                // Campos adicionales para compatibilidad
                usuario: {
                    nombre: 'Usuario de Prueba',
                    correo: 'prueba@uni.local'
                },
                categoria: {
                    nombre: 'Infraestructura'
                },
                objeto: {
                    nombre: 'Sistema de tuberías'
                },
                ubicacion: {
                    edificio: 'Edificio de Ciencias',
                    aula: 'Lab-201'
                }
            };
            
            mostrarDetalleReporte(reportePrueba);
            mostrarArchivosPrueba();
            mostrarHistorialPrueba();
            mostrarComentariosPrueba();
            
            // Cargar datos del usuario en el formulario
            cargarDatosUsuarioEnFormulario();
            
            // Ocultar indicador de carga
            mostrarCarga(false);
        }, 1000); // Simular tiempo de carga
    }
    
    function mostrarArchivosPrueba() {
        console.log('📁 Mostrando archivos de prueba...');
        
        // Buscar el contenedor de archivos en la nueva sección
        let contenedorArchivos = $('.archivos-grid');
        if (contenedorArchivos.length === 0) {
            console.log('❌ No se encontró contenedor de archivos');
            return;
        }
        
        // Mostrar la sección de archivos
        $('.archivos-section').show();
        
        contenedorArchivos.html(`
            <div class="archivo-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; margin-bottom: 1rem;">
                <div class="archivo-info" style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <span class="archivo-icono" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #e3f2fd; border-radius: 8px; color: #1976d2;">
                        <span class="material-symbols-outlined">image</span>
                    </span>
                    <div class="archivo-detalles">
                        <div class="archivo-nombre" style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">foto_fuga_lab.jpg</div>
                        <div class="archivo-meta" style="color: #666; font-size: 0.875rem;">Imagen • 2.3 MB • Subido hace 2 horas</div>
                    </div>
                </div>
                <div class="archivo-acciones">
                    <button class="btn-archivo" onclick="alert('📷 Vista previa de imagen - Datos de prueba')" style="padding: 0.5rem; border: none; background: #2196f3; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">visibility</span>
                    </button>
                </div>
            </div>
            
            <div class="archivo-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
                <div class="archivo-info" style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                    <span class="archivo-icono" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #fff3e0; border-radius: 8px; color: #f57c00;">
                        <span class="material-symbols-outlined">videocam</span>
                    </span>
                    <div class="archivo-detalles">
                        <div class="archivo-nombre" style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">video_problema.mp4</div>
                        <div class="archivo-meta" style="color: #666; font-size: 0.875rem;">Video • 15.7 MB • Subido hace 1 hora</div>
                    </div>
                </div>
                <div class="archivo-acciones">
                    <button class="btn-archivo" onclick="alert('🎥 Reproducir video - Datos de prueba')" style="padding: 0.5rem; border: none; background: #ff9800; color: white; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                        <span class="material-symbols-outlined" style="font-size: 1.2rem;">play_arrow</span>
                    </button>
                </div>
            </div>
        `);
    }
    
    function mostrarHistorialPrueba() {
        console.log('📜 Mostrando historial de prueba...');
        
        // Buscar el contenedor de historial existente
        let contenedorHistorial = $('.timeline');
        if (contenedorHistorial.length === 0) {
            // Si no existe, buscar la sección de historial
            contenedorHistorial = $('.historial-section .timeline');
        }
        if (contenedorHistorial.length === 0) {
            console.log('❌ No se encontró contenedor de historial');
            return;
        }
        
        // Mostrar la sección de historial (en caso de que esté oculta)
        $('.historial-section').show();
        
        contenedorHistorial.html(`
            <div class="timeline-item">
                <div class="timeline-marker" style="background: #4CAF50; box-shadow: 0 0 0 2px #4CAF50;"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>Reporte creado</h4>
                        <span class="timeline-fecha">Hace 3 horas</span>
                    </div>
                    <p>El reporte fue creado por <strong>Usuario de Prueba</strong></p>
                </div>
            </div>
            
            <div class="timeline-item">
                <div class="timeline-marker" style="background: #2196F3; box-shadow: 0 0 0 2px #2196F3;"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>Archivos adjuntados</h4>
                        <span class="timeline-fecha">Hace 2 horas</span>
                    </div>
                    <p>Se adjuntaron 2 archivos: <strong>foto_fuga_lab.jpg</strong>, <strong>video_problema.mp4</strong></p>
                </div>
            </div>
            
            <div class="timeline-item">
                <div class="timeline-marker" style="background: #FF9800; box-shadow: 0 0 0 2px #FF9800;"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>Estado actualizado</h4>
                        <span class="timeline-fecha">Hace 1 hora</span>
                    </div>
                    <p>El estado cambió a <strong style="color: #FF9800;">En revisión</strong></p>
                </div>
            </div>
        `);
    }
    
    function mostrarComentariosPrueba() {
        console.log('💬 Mostrando comentarios de prueba...');
        
        const contenedorComentarios = $('.comentarios-lista');
        if (contenedorComentarios.length === 0) {
            console.log('❌ No se encontró contenedor de comentarios');
            return;
        }
        
        contenedorComentarios.html(`
            <div class="comentario-item admin">
                <div class="comentario-avatar admin">
                    <span class="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div class="comentario-contenido">
                    <div class="comentario-header">
                        <span class="comentario-autor">Admin Sistema</span>
                        <span class="comentario-rol admin">Administrador</span>
                        <span class="comentario-fecha">Hace 2 horas</span>
                    </div>
                    <p class="comentario-texto">He revisado el reporte. Es necesario que el equipo de mantenimiento revise la tubería principal. ¿Podrías proporcionar más detalles sobre la ubicación exacta de la fuga?</p>
                </div>
            </div>
            
            <div class="comentario-item">
                <div class="comentario-avatar">
                    <span class="material-symbols-outlined">person</span>
                </div>
                <div class="comentario-contenido">
                    <div class="comentario-header">
                        <span class="comentario-autor">Usuario de Prueba</span>
                        <span class="comentario-rol">Monitor</span>
                        <span class="comentario-fecha">Hace 1 hora</span>
                    </div>
                    <p class="comentario-texto">La fuga está específicamente debajo del lavabo principal del laboratorio. Se puede ver una pequeña acumulación de agua en el piso. Adjunté fotos que muestran la ubicación exacta.</p>
                </div>
            </div>
        `);
    }
    
    // Funciones para manejar comentarios
    window.limpiarComentario = function() {
        const textarea = document.getElementById('nuevo-comentario');
        if (textarea) {
            textarea.value = '';
            textarea.focus();
        }
    };
    
    window.enviarComentario = async function() {
        const textarea = document.getElementById('nuevo-comentario');
        const texto = textarea ? textarea.value.trim() : '';
        
        if (!texto) {
            alert('Por favor, escribe un comentario antes de enviar.');
            return;
        }
        
        if (texto.length < 10) {
            alert('El comentario debe tener al menos 10 caracteres.');
            return;
        }
        
        // Obtener ID del reporte actual
        const reportId = obtenerIdReporte();
        if (!reportId) {
            alert('Error: No se pudo identificar el reporte actual.');
            return;
        }
        
        console.log(`📤 Enviando comentario al reporte ${reportId}:`, texto);
        
        // Deshabilitar botón mientras se envía
        const btnEnviar = document.querySelector('.btn-enviar');
        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...';
        }
        
        try {
            const response = await fetch(`/api/comments/report/${reportId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    comentario: texto
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Comentario enviado exitosamente:', data);
                
                // Limpiar formulario
                textarea.value = '';
                
                // Recargar comentarios para mostrar el nuevo
                await cargarComentariosReporte(reportId);
                
                // Scroll hacia el último comentario
                setTimeout(() => {
                    const contenedorComentarios = $('.comentarios-lista');
                    const ultimoComentario = contenedorComentarios.children().last()[0];
                    if (ultimoComentario) {
                        ultimoComentario.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
                
            } else {
                throw new Error(data.message || 'Error enviando comentario');
            }
            
        } catch (error) {
            console.error('❌ Error enviando comentario:', error);
            alert('Error enviando comentario: ' + error.message);
        } finally {
            // Restaurar botón
            if (btnEnviar) {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar';
            }
        }
    };
    
    // Función para cargar comentarios del reporte
    async function cargarComentariosReporte(reportId) {
        try {
            console.log(`💬 Cargando comentarios del reporte ${reportId}...`);
            
            const response = await fetch(`/api/comments/report/${reportId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('ℹ️ No se encontraron comentarios para este reporte');
                    mostrarComentarios([]);
                    return;
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('💬 Comentarios recibidos:', data);
            
            if (data.success) {
                mostrarComentarios(data.data || []);
            } else {
                throw new Error(data.message || 'Error obteniendo comentarios');
            }
            
        } catch (error) {
            console.error('❌ Error cargando comentarios:', error);
            mostrarComentarios([]);
        }
    }
    
    // Función para mostrar comentarios en la interfaz
    function mostrarComentarios(comentarios) {
        console.log(`💬 Mostrando ${comentarios.length} comentarios...`);
        
        const contenedorComentarios = $('.comentarios-lista');
        if (contenedorComentarios.length === 0) {
            console.log('❌ No se encontró contenedor de comentarios');
            return;
        }
        
        // Si no hay comentarios, mostrar mensaje
        if (comentarios.length === 0) {
            contenedorComentarios.html(`
                <div class="sin-comentarios">
                    <span class="material-symbols-outlined">chat_bubble_outline</span>
                    <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
            `);
            return;
        }
        
        // Generar HTML para cada comentario
        const comentariosHTML = comentarios.map(comentario => {
            const esAdmin = comentario.autor.rol === 'admin';
            const rolDisplay = esAdmin ? 'Administrador' : 'Monitor';
            const claseRol = esAdmin ? 'admin' : '';
            const fechaFormateada = formatearFechaComentario(comentario.fecha);
            
            return `
                <div class="comentario-item ${claseRol}">
                    <div class="comentario-avatar ${claseRol}">
                        <span class="material-symbols-outlined">${esAdmin ? 'admin_panel_settings' : 'person'}</span>
                    </div>
                    <div class="comentario-contenido">
                        <div class="comentario-header">
                            <span class="comentario-autor">${escapeHtml(comentario.autor.nombre)}</span>
                            <span class="comentario-rol ${claseRol}">${rolDisplay}</span>
                            <span class="comentario-fecha">${fechaFormateada}</span>
                        </div>
                        <p class="comentario-texto">${escapeHtml(comentario.texto)}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        contenedorComentarios.html(comentariosHTML);
    }
    
    // Función para formatear fecha de comentarios
    function formatearFechaComentario(fecha) {
        if (!fecha) return 'Sin fecha';
        
        const fechaComentario = new Date(fecha);
        const ahora = new Date();
        const diferencia = ahora - fechaComentario;
        
        // Menos de 1 minuto
        if (diferencia < 60000) {
            return 'Ahora';
        }
        
        // Menos de 1 hora
        if (diferencia < 3600000) {
            const minutos = Math.floor(diferencia / 60000);
            return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }
        
        // Menos de 24 horas
        if (diferencia < 86400000) {
            const horas = Math.floor(diferencia / 3600000);
            return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }
        
        // Más de 24 horas - mostrar fecha completa
        return fechaComentario.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Función para cargar datos del usuario en el formulario de comentarios
    async function cargarDatosUsuarioEnFormulario() {
        const usuario = await obtenerUsuarioActual();
        console.log('👤 Cargando datos del usuario en formulario:', usuario);
        
        // Actualizar nombre y rol en el formulario
        $('.usuario-nombre').text(usuario.nombre);
        $('.usuario-rol').text(usuario.rolDisplay);
        
        // Actualizar el avatar según el rol
        const avatarContainer = $('.comentario-form .avatar');
        if (avatarContainer.length > 0) {
            const icono = usuario.rol === 'admin' ? 'admin_panel_settings' : 'person';
            const colorScheme = usuario.rol === 'admin' ? 'admin' : '';
            
            avatarContainer.removeClass('admin').addClass(colorScheme);
            avatarContainer.find('.material-symbols-outlined').text(icono);
        }
    }
    
    // Función para obtener datos del usuario actual
    async function obtenerUsuarioActual() {
        try {
            const response = await fetch('/api/users/profile');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    return {
                        nombre: data.data.nombre || 'Usuario',
                        rol: data.data.rol || 'monitor',
                        rolDisplay: data.data.rol === 'admin' ? 'Administrador' : 'Monitor'
                    };
                }
            }
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
        }
        
        // Valores por defecto si falla
        return {
            nombre: 'Usuario',
            rol: 'monitor',
            rolDisplay: 'Monitor'
        };
    }
    
    // Función para escapar HTML y prevenir XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Función para inicializar después de navegación SPA
    window.inicializarDetalleReporte = function() {
        console.log('🔄 Reinicializando página de detalle reporte...');
        const reportId = obtenerIdReporte();
        if (reportId) {
            cargarDetalleReporte(reportId);
        }
        
        // Cargar datos del usuario en el formulario
        cargarDatosUsuarioEnFormulario();
        
        // Manejar textarea con auto-resize
        const textarea = document.getElementById('nuevo-comentario');
        if (textarea) {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            
            // Manejar Enter para enviar
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                    e.preventDefault();
                    enviarComentario();
                }
            });
        }
    };
});