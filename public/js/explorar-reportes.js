// Función global para recargar datos
window.recargarReportes = function() {
    console.log('🔄 MANUAL: Recargando reportes...');
    
    // Limpiar caché primero
    todosLosReportes = [];
    reportesFiltrados = [];
    
    // Limpiar cualquier sessionStorage relacionado
    if (window.sessionStorage) {
        sessionStorage.removeItem('reportes_actualizados');
        sessionStorage.removeItem('ultimo_cambio_estado');
    }
    
    if (typeof cargarReportes === 'function') {
        cargarReportes();
    } else {
        console.error('❌ Función cargarReportes no disponible');
    }
};

// Función global para inicializar la página completa
window.inicializarExplorarReportes = function() {
    console.log('🚀 INICIALIZACIÓN: Inicializando explorar reportes...');
    
    // Verificar si necesitamos recargar datos
    const necesitaActualizar = sessionStorage.getItem('reportes_actualizados');
    const ultimoCambio = sessionStorage.getItem('ultimo_cambio_estado');
    
    if (necesitaActualizar || ultimoCambio) {
        console.log('🔄 Detectados cambios en reportes, forzando recarga...', { necesitaActualizar, ultimoCambio });
        sessionStorage.removeItem('reportes_actualizados');
        sessionStorage.removeItem('ultimo_cambio_estado');
        // Limpiar caché de reportes
        todosLosReportes = [];
        reportesFiltrados = [];
    }
    
    // Configurar listener para eventos de cambios de reporte
    window.removeEventListener('reporteActualizado', manejarReporteActualizado);
    window.addEventListener('reporteActualizado', manejarReporteActualizado);
    
    // Re-cargar filtros dinámicos
    if (typeof cargarCategoriasFiltro === 'function') {
        cargarCategoriasFiltro();
    }
    if (typeof cargarEstadosFiltro === 'function') {
        cargarEstadosFiltro();
    }
    
    // Cargar reportes
    if (typeof cargarReportes === 'function') {
        cargarReportes();
    }
    
    // Configurar eventos si no están configurados
    configurarEventos();
    
    console.log('✅ INICIALIZACIÓN: Explorar reportes inicializado');
};

// Función para manejar actualizaciones de reportes
function manejarReporteActualizado(event) {
    console.log('📢 Evento de reporte actualizado recibido:', event.detail);
    
    // Forzar recarga de datos
    todosLosReportes = [];
    reportesFiltrados = [];
    
    if (typeof cargarReportes === 'function') {
        console.log('🔄 Recargando reportes por evento...');
        cargarReportes();
    }
}

// Hacer funciones y variables accesibles globalmente
let cargarReportes, renderizarTabla, actualizarContadores, cargarCategoriasFiltro, cargarEstadosFiltro, configurarEventos;
let reportesFiltrados = [];
let todosLosReportes = [];

// Paginación cliente
let currentPage = 1;
const PAGE_SIZE = 6; // Mostrar 6 items por página
// Modo paginación server-side
const SERVER_SIDE = true;

// Información de paginación devuelta por el servidor
let paginationInfo = {
    totalItems: 0,
    totalPages: 1
};

/**
 * Renderizar la página actual tomando los reportes filtrados y cortando el slice.
 */
function renderCurrentPage() {
    if (SERVER_SIDE) {
        // Pedir la página al servidor
        cargarReportes(currentPage);
        return;
    }

    const totalItems = reportesFiltrados.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = reportesFiltrados.slice(start, end);

    renderizarTabla(pageItems);
    renderPageControls(currentPage, totalPages, totalItems, start + 1, Math.min(end, totalItems));
}

/**
 * Renderizar controles de paginación simples (Prev / Página X de Y / Next)
 */
function renderPageControls(page, totalPages, totalItems, fromItem, toItem) {
    // Asegurarse de que exista el contenedor
    let container = $('#paginacion-reportes');
    if (container.length === 0) {
        // Insertar después de la tabla si no existe (sin estilos inline)
        $('.tabla-container').append('<div id="paginacion-reportes" class="paginacion-container"></div>');
        container = $('#paginacion-reportes');
    }

    const prevDisabled = page <= 1 ? 'disabled' : '';
    const nextDisabled = page >= totalPages ? 'disabled' : '';

    // Ajustes cuando no hay items
    if (totalItems === 0) {
        fromItem = 0;
        toItem = 0;
    }

    container.html(`
        <div class="paginacion-info">Mostrando ${fromItem}-${toItem} de ${totalItems}</div>
        <div class="paginacion-botones">
            <button id="paginacion-prev" class="btn-paginacion" ${prevDisabled}>Anterior</button>
            <span class="paginacion-page-label">Página ${page} / ${totalPages}</span>
            <button id="paginacion-next" class="btn-paginacion" ${nextDisabled}>Siguiente</button>
        </div>
    `);

    // Eventos
    $('#paginacion-prev').off('click').on('click', function() {
        if (currentPage > 1) {
            currentPage -= 1;
            renderCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    $('#paginacion-next').off('click').on('click', function() {
        if (currentPage < totalPages) {
            currentPage += 1;
            renderCurrentPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ===========================
// FUNCIONES DE FILTROS DINÁMICOS
// ===========================

// Función para cargar categorías en el filtro
cargarCategoriasFiltro = async function() {
    try {
        console.log('🔄 Cargando categorías para filtro...');
        
        const response = await fetch('/api/categories', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const select = $('#filtro-categoria');
                select.html('<option value="">Todas</option>');
                
                data.data.forEach(categoria => {
                    select.append(`<option value="${categoria.id_categoria}">${categoria.nombre}</option>`);
                });
                
                console.log('✅ Categorías cargadas en filtro:', data.data.length);
            } else {
                console.error('❌ Error en respuesta de categorías:', data.message);
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
    }
};

// Función para cargar estados en el filtro
cargarEstadosFiltro = async function() {
    try {
        console.log('🔄 Cargando estados para filtro...');
        
        const response = await fetch('/api/categories/states', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const select = $('#filtro-estado');
                select.html('<option value="">Todos</option>');
                
                data.data.forEach(estado => {
                    select.append(`<option value="${estado.nombre}">${estado.nombre.charAt(0).toUpperCase() + estado.nombre.slice(1)}</option>`);
                });
                
                console.log('✅ Estados cargados en filtro:', data.data.length);
            } else {
                console.error('❌ Error en respuesta de estados:', data.message);
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar estados:', error);
    }
};

// ===========================
// FUNCIONES DE FILTRADO
// ===========================

// Función para renderizar la tabla de reportes
renderizarTabla = function(reportes) {
    const tbody = $('#tabla-reportes-body');
    tbody.empty();

    if (reportes.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No se encontraron reportes que coincidan con los filtros seleccionados.
                </td>
            </tr>
        `);
        return;
    }

    reportes.forEach(reporte => {
        console.log(`🔍 RENDERIZANDO REPORTE ${reporte.id_reporte}:`, {
            id: reporte.id_reporte,
            titulo: reporte.titulo,
            estado: reporte.estado,
            estado_tipo: typeof reporte.estado,
            categoria: reporte.categoria_nombre,
            id_categoria: reporte.id_categoria
        });
        
        // Determinar si es urgente (categoría "Urgencia" tiene id 6)
        const esUrgente = reporte.id_categoria === 6 || 
                         (reporte.categoria_nombre && reporte.categoria_nombre.toLowerCase().includes('urgencia'));
        
        // Mapear estados de la base de datos a clases CSS (los estados vienen capitalizados)
        const estadoNormalizado = (reporte.estado || 'Pendiente').toLowerCase();
        const estadoClass = {
            'pendiente': 'estado-abierto',
            'revisado': 'estado-revision', 
            'en proceso': 'estado-proceso', 
            'resuelto': 'estado-resuelto',
            'cerrado': 'estado-resuelto'
        }[estadoNormalizado] || 'estado-abierto';

        const estadoTexto = {
            'pendiente': 'PENDIENTE',
            'revisado': 'REVISADO',
            'en proceso': 'EN PROCESO', 
            'resuelto': 'RESUELTO',
            'cerrado': 'CERRADO'
        }[estadoNormalizado] || 'PENDIENTE';

        console.log(`🎨 ESTADO ${reporte.id_reporte}:`, {
            original: reporte.estado,
            normalizado: estadoNormalizado,
            clase: estadoClass,
            texto: estadoTexto,
            esUrgente: esUrgente
        });

        // Formatear fecha
        const fecha = new Date(reporte.fecha_creacion || reporte.fecha_reporte);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');

        // Crear ubicación completa
        const ubicacion = reporte.ubicacion_nombre && reporte.salon_nombre 
            ? `${reporte.ubicacion_nombre} - ${reporte.salon_nombre}`
            : 'Sin ubicación';

        // Crear badge de prioridad
        const prioridadBadge = esUrgente 
            ? `<span class="badge-prioridad urgente">
                <span class="material-symbols-outlined">emergency</span>
                URGENTE
               </span>`
            : `<span class="badge-prioridad normal">NORMAL</span>`;

        // Clase de fila para reportes urgentes
        const filaClass = esUrgente ? ' fila-urgente' : '';

        tbody.append(`
            <tr data-reporte-id="${reporte.id_reporte}"${filaClass}>
                <td class="id-reporte">#${reporte.id_reporte}</td>
                <td class="titulo">${reporte.titulo || 'Sin título'}</td>
                <td class="categoria">${reporte.categoria_nombre || 'Sin categoría'}</td>
                <td class="prioridad">${prioridadBadge}</td>
                <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
                <td class="ubicacion">${ubicacion}</td>
                <td class="usuario">${reporte.usuario_nombre || 'Sin usuario'}</td>
                <td class="fecha">${fechaFormateada}</td>
                <td class="acciones">
                    <div class="contenedor-acciones">
                        <button class="btn-accion btn-ver" title="Ver detalles" data-action="ver" data-id="${reporte.id_reporte}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });
};

// Función para actualizar contadores
actualizarContadores = function() {
    // Si el servidor proporciona el totalItems, usarlo para el contador total
    const totalReportes = paginationInfo.totalItems || reportesFiltrados.length;
    const pendientes = reportesFiltrados.filter(r => (r.estado || '').toLowerCase() === 'pendiente').length;
    const enProceso = reportesFiltrados.filter(r => (r.estado || '').toLowerCase().includes('proceso')).length;
    const resueltos = reportesFiltrados.filter(r => {
        const st = (r.estado || '').toLowerCase();
        return st === 'resuelto' || st === 'cerrado' || st === 'resuelto';
    }).length;

    // Actualizar contadores en la interfaz (si existen)
    $('#total-reportes').text(totalReportes);
    $('#reportes-pendientes').text(pendientes);
    $('#reportes-proceso').text(enProceso);
    $('#reportes-resueltos').text(resueltos);
};

// Función para actualizar notificaciones urgentes
function actualizarNotificacionesUrgentes(reportes) {
    console.log('🚨 Actualizando notificaciones urgentes...');
    
    // Filtrar reportes urgentes (categoría "Urgencia" o id_categoria = 6)
    const reportesUrgentes = reportes.filter(reporte => 
        reporte.id_categoria === 6 || 
        (reporte.categoria_nombre && reporte.categoria_nombre.toLowerCase().includes('urgencia'))
    );
    
    console.log(`🚨 Reportes urgentes encontrados: ${reportesUrgentes.length}`, reportesUrgentes);
    
    const seccionNotificaciones = $('#notificaciones-urgentes');
    const listaReportesUrgentes = $('#lista-reportes-urgentes');
    
    if (reportesUrgentes.length > 0) {
        // Mostrar sección de notificaciones
        seccionNotificaciones.show();
        
        // Limpiar lista anterior
        listaReportesUrgentes.empty();
        
        // Agregar cada reporte urgente
        reportesUrgentes.forEach(reporte => {
            const fecha = new Date(reporte.fecha_creacion || reporte.fecha_reporte);
            const fechaFormateada = fecha.toLocaleDateString('es-ES');
            
            const ubicacion = reporte.ubicacion_nombre && reporte.salon_nombre 
                ? `${reporte.ubicacion_nombre} - ${reporte.salon_nombre}`
                : 'Sin ubicación';
                
            const estadoTexto = (reporte.estado || 'Pendiente').toUpperCase();
            
            const itemHtml = `
                <div class="reporte-urgente-item" data-reporte-id="${reporte.id_reporte}">
                    <div class="info-reporte-urgente">
                        <div class="titulo-reporte-urgente">
                            Reporte #${reporte.id_reporte}: ${reporte.titulo || 'Sin título'}
                        </div>
                        <div class="detalles-reporte-urgente">
                            ${ubicacion} • ${estadoTexto} • ${fechaFormateada}
                        </div>
                    </div>
                </div>
            `;
            
            listaReportesUrgentes.append(itemHtml);
        });
        
        // Actualizar el título con el contador
        $('.titulo-notificacion').html(`
            <span class="material-symbols-outlined" style="font-size: 18px;">emergency</span>
            Notificaciones Urgentes (${reportesUrgentes.length})
        `);
        
    } else {
        // Ocultar sección si no hay reportes urgentes
        seccionNotificaciones.hide();
    }
}

// Función para configurar eventos de notificaciones urgentes
function configurarEventosNotificaciones() {
    // Cerrar notificaciones
    $(document).on('click', '#cerrar-notificaciones', function() {
        $('#notificaciones-urgentes').fadeOut(300);
    });
    
    // Navegar al reporte urgente cuando se hace clic
    $(document).on('click', '.reporte-urgente-item', function() {
        const reporteId = $(this).data('reporte-id');
        console.log('🔗 Navegando al reporte urgente:', reporteId);
        
        // Crear URL de detalle del reporte
        const urlDetalle = `detalle-reporte-admin.html?id=${reporteId}`;
        
        // Usar navegación SPA si está disponible
        if (window.spaNavigation && window.spaNavigation.navigate) {
            window.spaNavigation.navigate(urlDetalle);
        } else {
            window.location.href = urlDetalle;
        }
    });
}

// Función para aplicar filtros
function aplicarFiltros() {
    // Aplicar estilos visuales para filtros activos
    actualizarEstilosFiltros();
    
    // Para paginación server-side, simplemente recargar la primera página con los filtros actuales
    currentPage = 1;
    cargarReportes(1);
}

// Función para actualizar estilos visuales de filtros activos
function actualizarEstilosFiltros() {
    const prioridad = $('#filtro-prioridad').val();
    const filtroGrupo = $('#filtro-prioridad').closest('.filtro-grupo');
    
    if (prioridad) {
        filtroGrupo.addClass('filtro-prioridad-activo');
        $('#filtro-prioridad').attr('data-filtered', 'true');
    } else {
        filtroGrupo.removeClass('filtro-prioridad-activo');
        $('#filtro-prioridad').removeAttr('data-filtered');
    }
    
    // Aplicar estilos similares para otros filtros
    $('.filtro-select').each(function() {
        if ($(this).val()) {
            $(this).attr('data-filtered', 'true');
        } else {
            $(this).removeAttr('data-filtered');
        }
    });
}

// ===========================
// CONFIGURACIÓN DE EVENTOS
// ===========================

// Función global para configurar eventos
configurarEventos = function() {
    console.log('🎯 Configurando eventos de explorar reportes...');
    
    // Remover eventos anteriores para evitar duplicados
    $('.filtro-buscar').off('input.explorarReportes');
    $('#filtro-categoria, #filtro-prioridad, #filtro-estado, #filtro-fecha').off('change.explorarReportes');
    $(document).off('click.explorarReportes', 'a[data-page="new-report"]');
    
    // Configurar eventos con namespace para poder removerlos
    $('.filtro-buscar').on('input.explorarReportes', aplicarFiltros);
    $('#filtro-categoria, #filtro-prioridad, #filtro-estado, #filtro-fecha').on('change.explorarReportes', aplicarFiltros);
    
    // Configurar navegación para el botón "Nuevo reporte"
    $(document).on('click.explorarReportes', 'a[data-page="new-report"]', function(e) {
        e.preventDefault();
        console.log('🔗 Navegando a crear reporte...');
        
        // Si hay navegación SPA disponible, usarla
        if (window.spaNavigation && window.spaNavigation.navigate) {
            window.spaNavigation.navigate('crear-reporte.html');
        } else {
            // Fallback a navegación normal
            window.location.href = 'crear-reporte.html';
        }
    });
    
    // Configurar eventos de notificaciones urgentes
    configurarEventosNotificaciones();
    
    console.log('✅ Eventos configurados correctamente');
};

// Asignar también como función global del window
window.configurarEventos = configurarEventos;

// Sistema de gestión de explorar reportes
$(document).ready(function() {
    console.log('🚀 Explorar Reportes - Script cargado');
    
    // Cargar filtros dinámicos al inicializar
    cargarCategoriasFiltro();
    cargarEstadosFiltro();

    // Cargar reportes desde la API (server-side pagination)
    cargarReportes = async function(page = 1) {
        try {
            console.log('🔄 Cargando reportes desde la API (server-side)...');
            console.log('🌐 URL: /api/reports');
            // establecer página actual
            currentPage = page || 1;
            
            // Mostrar indicador de carga
            const tbody = $('#tabla-reportes-body');
            tbody.html(`
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
                        Cargando reportes...
                    </td>
                </tr>
            `);
            
            // Construir query params: page, limit y filtros
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', PAGE_SIZE);

            const buscar = $('.filtro-buscar').val();
            const categoria = $('#filtro-categoria').val();
            const prioridad = $('#filtro-prioridad').val();
            const estado = $('#filtro-estado').val();
            const fecha = $('#filtro-fecha').val();

            // Normalizar valores de filtros antes de enviarlos al servidor
            if (buscar) params.append('buscar', buscar);
            if (categoria) params.append('id_categoria', categoria);
            if (prioridad) params.append('prioridad', prioridad);
            if (estado) {
                const normalizedEstado = (function(v) {
                    if (!v) return v;
                    const s = v.toString().toLowerCase().trim();
                    if (s === 'en proceso' || s === 'en-proceso' || s === 'en_proceso' || s === 'enproceso') return 'en_proceso';
                    if (s === 'pendiente') return 'pendiente';
                    if (s === 'resuelto') return 'resuelto';
                    if (s === 'revisado') return 'revisado';
                    if (s === 'abierto') return 'abierto';
                    return v; // fallback
                })(estado);
                params.append('estado', normalizedEstado);
            }

            // Mapear filtro de fecha a fecha_desde/fecha_hasta
            if (fecha) {
                const hoy = new Date();
                let desde = null;
                switch (fecha) {
                    case 'hoy':
                        desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                        break;
                    case 'semana':
                        desde = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'mes':
                        desde = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                }
                if (desde) {
                    params.append('fecha_desde', new Date(desde).toISOString().slice(0,19).replace('T',' '));
                    params.append('fecha_hasta', new Date().toISOString().slice(0,19).replace('T',' '));
                }
            }

            const timestamp = new Date().getTime();
            params.append('t', timestamp);

            const response = await fetch(`/api/reports?${params.toString()}`, {
                method: 'GET',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate', // Evitar cache más agresivamente
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            console.log('📡 Respuesta de API:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            const data = await response.json();
            console.log('📊 Datos recibidos RAW:', data);
            console.log('📊 ¿Es exitoso?:', data.success);
            console.log('📊 ¿Tiene datos?:', !!data.data);
            console.log('📊 Cantidad de reportes en página:', data.data?.length);

            if (response.ok && data.success) {
                // Actualizar datos de la página actual
                todosLosReportes = data.data || [];
                reportesFiltrados = [...todosLosReportes];
                paginationInfo.totalItems = data.pagination?.totalItems || 0;
                paginationInfo.totalPages = data.pagination?.totalPages || 1;
                console.log('✅ Reportes cargados en página:', todosLosReportes.length, ' totalItems:', paginationInfo.totalItems);

                // Renderizar tabla con los items de la página
                renderizarTabla(reportesFiltrados);
                renderPageControls(currentPage, paginationInfo.totalPages, paginationInfo.totalItems, (paginationInfo.totalItems>0? ( (currentPage-1)*PAGE_SIZE +1) : 0), Math.min(currentPage*PAGE_SIZE, paginationInfo.totalItems));
                
                // Actualizar notificaciones urgentes
                actualizarNotificacionesUrgentes(reportesFiltrados);
                
                // Actualizar contadores (usar totalItems como total si está disponible)
                actualizarContadores();
            } else {
                console.error('❌ Error al cargar reportes:', {
                    status: response.status,
                    message: data.message,
                    data: data
                });
                mostrarError('Error al cargar los reportes: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            mostrarError('Error de conexión. Por favor, verifica tu conexión a internet.');
        }
    }

    function mostrarError(mensaje) {
        console.error('🚨 ERROR:', mensaje);
        const tbody = $('#tabla-reportes-body');
        tbody.html(`
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #dc2626; background-color: #fef2f2;">
                    <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: 16px;">error</span>
                    <strong style="display: block; margin-bottom: 8px;">Error al cargar reportes</strong>
                    <span style="color: #7f1d1d; font-size: 14px;">${mensaje}</span>
                    <br><br>
                    <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Recargar página
                    </button>
                </td>
            </tr>
        `);
    }

    // ===========================
    // FUNCIONES DE FILTRADO
    // ===========================

    // Función para actualizar gráficos
    function actualizarGraficos() {
        // Actualizar distribución por categoría
        const distribucionCategorias = {};
        reportesFiltrados.forEach(reporte => {
            distribucionCategorias[reporte.categoria] = (distribucionCategorias[reporte.categoria] || 0) + 1;
        });

        const maxReportes = Math.max(...Object.values(distribucionCategorias), 1);

        $('.barra-fill').each(function() {
            const categoria = $(this).data('categoria');
            const cantidad = distribucionCategorias[categoria] || 0;
            const porcentaje = (cantidad / maxReportes) * 100;
            $(this).css('width', porcentaje + '%');
        });
    }

    // Event listeners para filtros
    $('.filtro-buscar').on('input', debounce(aplicarFiltros, 300));
    $('#filtro-categoria, #filtro-estado, #filtro-fecha').on('change', aplicarFiltros);

    // Event listeners para acciones de reportes
    $(document).on('click', '.btn-accion', function() {
        const action = $(this).data('action');
        const reporteId = $(this).data('id');
        
        switch(action) {
            case 'ver':
                verDetalleReporte(reporteId);
                break;
            case 'editar':
                editarReporte(reporteId);
                break;
            case 'eliminar':
                eliminarReporte(reporteId);
                break;
        }
    });

    // Funciones de acciones
    async function verDetalleReporte(id) {
        console.log('👁️ Ver detalles del reporte:', id);
        try {
            // Obtener rol si no está aún disponible
            if (typeof window.currentUserRole === 'undefined' || window.currentUserRole === null) {
                try {
                    const resp = await fetch('/api/users/profile', { credentials: 'include' });
                    if (resp.ok) {
                        const profile = await resp.json();
                        window.currentUserRole = profile && profile.data ? profile.data.rol : null;
                    }
                } catch (e) {
                    console.warn('No se pudo obtener perfil al navegar a detalle:', e);
                }
            }

            const isAdmin = (typeof window.currentUserRole !== 'undefined') ? window.currentUserRole === 'admin' : false;
            const targetPage = isAdmin === true ? 'detalle-reporte-admin' : 'detalle-reporte';

            if (window.spaNav && typeof window.spaNav.navigateTo === 'function') {
                window.spaNav.navigateTo(targetPage, `?id=${id}`);
            } else if (window.spaNavigation && typeof window.spaNavigation.navigate === 'function') {
                window.spaNavigation.navigate(targetPage + '.html' + `?id=${id}`);
            } else {
                const fallbackUrl = (targetPage === 'detalle-reporte-admin') ? `detalle-reporte-admin.html?id=${id}` : `detalle-reporte.html?id=${id}`;
                window.location.href = fallbackUrl;
            }
        } catch (err) {
            console.error('Error navegando a detalle:', err);
            // Intento de fallback simple
            window.location.href = `detalle-reporte.html?id=${id}`;
        }
    }

    function editarReporte(id) {
        console.log('✏️ Editar reporte:', id);
        // Usar navegación SPA si está disponible
        if (window.spaNav) {
            window.spaNav.navigateTo('crear-reporte', `?edit=${id}`);
        } else {
            // Fallback a navegación tradicional
            window.location.href = `crear-reporte.html?edit=${id}`;
        }
    }

    function eliminarReporte(id) {
        if (confirm(`¿Estás seguro de que deseas eliminar el reporte ${id}?`)) {
            // Simular eliminación
            const index = reportesData.findIndex(r => r.id === id);
            if (index > -1) {
                reportesData.splice(index, 1);
                aplicarFiltros();
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('Reporte eliminado exitosamente', 'success');
            }
        }
    }

    // Función de debounce para optimizar búsqueda
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = $(`
            <div class="notificacion ${tipo}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${tipo === 'success' ? 'var(--success-color)' : 'var(--info-color)'};
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 6px var(--shadow-color);
                z-index: 1000;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
            ">
                ${mensaje}
            </div>
        `);

        $('body').append(notificacion);
        
        setTimeout(() => {
            notificacion.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
        }, 100);

        setTimeout(() => {
            notificacion.css({
                opacity: 0,
                transform: 'translateY(-20px)'
            });
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // Inicializar la página (usar paginación)
    currentPage = 1;
    renderCurrentPage();
    actualizarGraficos();

    // Animaciones de entrada
    $('.seccion-reportes-recientes').css({
        opacity: 0,
        transform: 'translateY(20px)'
    }).animate({
        opacity: 1
    }, 500).css('transform', 'translateY(0)');

    setTimeout(() => {
        $('.seccion-inferior > *').each(function(index) {
            $(this).css({
                opacity: 0,
                transform: 'translateY(20px)'
            });
            
            setTimeout(() => {
                $(this).animate({opacity: 1}, 300).css('transform', 'translateY(0)');
            }, index * 200);
        });
    }, 300);

    // Configurar eventos
    configurarEventos();

    // Cargar reportes al inicializar
    console.log('📅 Iniciando carga de reportes...');
    cargarReportes();

    // Gestión responsive del sidebar
    function handleResize() {
        if ($(window).width() <= 768) {
            $('.contenido-wrapper').css('margin-left', '0');
        } else {
            $('.contenido-wrapper').css('margin-left', '256px');
        }
    }

    $(window).on('resize', handleResize);
    handleResize();
});

// Función global para debug
window.testAPI = async function() {
    console.log('🧪 TEST: Probando API manualmente...');
    try {
        const response = await fetch('/api/reports', {
            credentials: 'include'
        });
        const data = await response.json();
        console.log('🧪 TEST: Respuesta:', response.status, data);
        return data;
    } catch (error) {
        console.error('🧪 TEST: Error:', error);
        return error;
    }
};

// Función global para recargar datos (mantenida por compatibilidad)
window.recargarReportes = function() {
    console.log('🔄 MANUAL: Recargando reportes...');
    if (typeof cargarReportes === 'function') {
        cargarReportes();
    } else {
        console.error('❌ Función cargarReportes no disponible');
    }
};

// Exportar funciones para uso global si es necesario
window.ExplorarReportes = {
    cargarReportes: function() {
        if (typeof cargarReportes === 'function') {
            cargarReportes();
        }
    },
    actualizarTabla: function(nuevosReportes) {
        if (Array.isArray(nuevosReportes)) {
            todosLosReportes.length = 0;
            todosLosReportes.push(...nuevosReportes);
            aplicarFiltros();
        }
    }
};