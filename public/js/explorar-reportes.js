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
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
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
            estado_tipo: typeof reporte.estado
        });
        
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
            texto: estadoTexto
        });

        // Formatear fecha
        const fecha = new Date(reporte.fecha_creacion || reporte.fecha_reporte);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');

        // Crear ubicación completa
        const ubicacion = reporte.ubicacion_nombre && reporte.salon_nombre 
            ? `${reporte.ubicacion_nombre} - ${reporte.salon_nombre}`
            : 'Sin ubicación';

        tbody.append(`
            <tr data-reporte-id="${reporte.id_reporte}">
                <td class="id-reporte">#${reporte.id_reporte}</td>
                <td class="titulo">${reporte.titulo || 'Sin título'}</td>
                <td class="categoria">${reporte.categoria_nombre || 'Sin categoría'}</td>
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
    const totalReportes = reportesFiltrados.length;
    const pendientes = reportesFiltrados.filter(r => r.estado === 'pendiente').length;
    const enProceso = reportesFiltrados.filter(r => r.estado === 'en_progreso').length;
    const resueltos = reportesFiltrados.filter(r => r.estado === 'resuelto' || r.estado === 'cerrado').length;

    // Actualizar contadores en la interfaz (si existen)
    $('#total-reportes').text(totalReportes);
    $('#reportes-pendientes').text(pendientes);
    $('#reportes-proceso').text(enProceso);
    $('#reportes-resueltos').text(resueltos);
};

// Función para aplicar filtros
function aplicarFiltros() {
    const busqueda = $('.filtro-buscar').val().toLowerCase();
    const categoriaFiltro = $('#filtro-categoria').val();
    const estadoFiltro = $('#filtro-estado').val();
    const fechaFiltro = $('#filtro-fecha').val();

    reportesFiltrados = todosLosReportes.filter(reporte => {
        const coincideBusqueda = !busqueda || 
            reporte.id_reporte.toString().includes(busqueda) ||
            (reporte.titulo && reporte.titulo.toLowerCase().includes(busqueda)) ||
            (reporte.usuario_nombre && reporte.usuario_nombre.toLowerCase().includes(busqueda)) ||
            (reporte.categoria_nombre && reporte.categoria_nombre.toLowerCase().includes(busqueda)) ||
            (reporte.ubicacion_nombre && reporte.ubicacion_nombre.toLowerCase().includes(busqueda)) ||
            (reporte.salon_nombre && reporte.salon_nombre.toLowerCase().includes(busqueda));

        const coincideCategoria = !categoriaFiltro || reporte.id_categoria == categoriaFiltro;
        const coincideEstado = !estadoFiltro || reporte.estado === estadoFiltro;
        
        let coincideFecha = true;
        if (fechaFiltro) {
            const fechaReporte = new Date(reporte.fecha_creacion || reporte.fecha_reporte);
            const hoy = new Date();
            
            switch(fechaFiltro) {
                case 'hoy':
                    coincideFecha = fechaReporte.toDateString() === hoy.toDateString();
                    break;
                case 'semana':
                    const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                    coincideFecha = fechaReporte >= semanaAtras;
                    break;
                case 'mes':
                    const mesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
                    coincideFecha = fechaReporte >= mesAtras;
                    break;
            }
        }

        return coincideBusqueda && coincideCategoria && coincideEstado && coincideFecha;
    });

    renderizarTabla(reportesFiltrados);
    actualizarContadores();
}

// ===========================
// CONFIGURACIÓN DE EVENTOS
// ===========================

// Función global para configurar eventos
configurarEventos = function() {
    console.log('🎯 Configurando eventos de explorar reportes...');
    
    // Remover eventos anteriores para evitar duplicados
    $('.filtro-buscar').off('input.explorarReportes');
    $('#filtro-categoria, #filtro-estado, #filtro-fecha').off('change.explorarReportes');
    $(document).off('click.explorarReportes', 'a[data-page="new-report"]');
    
    // Configurar eventos con namespace para poder removerlos
    $('.filtro-buscar').on('input.explorarReportes', aplicarFiltros);
    $('#filtro-categoria, #filtro-estado, #filtro-fecha').on('change.explorarReportes', aplicarFiltros);
    
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

    // Cargar reportes desde la API
    cargarReportes = async function() {
        try {
            console.log('🔄 Cargando reportes desde la API...');
            console.log('🌐 URL: /api/reports');
            
            // Mostrar indicador de carga
            const tbody = $('#tabla-reportes-body');
            tbody.html(`
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
                        Cargando reportes...
                    </td>
                </tr>
            `);
            
            // Agregar timestamp para evitar cache del navegador
            const timestamp = new Date().getTime();
            const ultimoCambio = sessionStorage.getItem('ultimo_cambio_estado') || '0';
            
            const response = await fetch(`/api/reports?t=${timestamp}&last_change=${ultimoCambio}`, {
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
            console.log('📊 Cantidad de reportes:', data.data?.length);
            
            if (response.ok && data.success) {
                todosLosReportes = data.data || [];
                reportesFiltrados = [...todosLosReportes];
                console.log('✅ Reportes cargados exitosamente:', todosLosReportes.length);
                
                // Log específico para el reporte 12
                const reporte12 = todosLosReportes.find(r => r.id_reporte === 12);
                if (reporte12) {
                    console.log('🔍 REPORTE 12 EN FRONTEND:', {
                        id: reporte12.id_reporte,
                        titulo: reporte12.titulo,
                        estado: reporte12.estado,
                        categoria: reporte12.categoria_nombre
                    });
                } else {
                    console.log('❌ REPORTE 12 NO ENCONTRADO en datos del frontend');
                }
                
                console.log('📋 Primer reporte (ejemplo):', todosLosReportes[0]);
                renderizarTabla(reportesFiltrados);
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
                <td colspan="8" style="text-align: center; padding: 40px; color: #dc2626; background-color: #fef2f2;">
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

    // Inicializar la página
    renderizarTabla(reportesFiltrados);
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