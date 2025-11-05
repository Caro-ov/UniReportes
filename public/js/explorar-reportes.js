// Función global para recargar datos
window.recargarReportes = function() {
    console.log('🔄 MANUAL: Recargando reportes...');
    if (typeof cargarReportes === 'function') {
        cargarReportes();
    } else {
        console.error('❌ Función cargarReportes no disponible');
    }
};

// Hacer funciones y variables accesibles globalmente
let cargarReportes, renderizarTabla, actualizarContadores;
let reportesFiltrados = [];
let todosLosReportes = [];

// Sistema de gestión de explorar reportes
$(document).ready(function() {
    console.log('🚀 Explorar Reportes - Script cargado');
    
    // Las variables ya están declaradas globalmente arriba
    
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
            
            const response = await fetch('/api/reports', {
                method: 'GET',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Respuesta de API:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            const data = await response.json();
            console.log('📊 Datos recibidos:', data);
            
            if (response.ok && data.success) {
                todosLosReportes = data.data || [];
                reportesFiltrados = [...todosLosReportes];
                console.log('✅ Reportes cargados exitosamente:', todosLosReportes.length);
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
            // Mapear estados de la base de datos a clases CSS
            const estadoClass = {
                'pendiente': 'estado-abierto',
                'en_progreso': 'estado-proceso', 
                'resuelto': 'estado-resuelto',
                'cerrado': 'estado-resuelto'
            }[reporte.estado] || 'estado-abierto';

            const estadoTexto = {
                'pendiente': 'Pendiente',
                'en_progreso': 'En Proceso',
                'resuelto': 'Resuelto',
                'cerrado': 'Cerrado'
            }[reporte.estado] || 'Pendiente';

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
                            <button class="btn-accion btn-editar" title="Editar" data-action="editar" data-id="${reporte.id_reporte}">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="btn-accion btn-eliminar" title="Eliminar" data-action="eliminar" data-id="${reporte.id_reporte}">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
        });
    }

    // ===========================
    // FUNCIONES DE FILTROS DINÁMICOS
    // ===========================
    
    // Función para cargar categorías en el filtro
    async function cargarCategoriasFiltro() {
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
    }
    
    // Función para cargar estados en el filtro
    async function cargarEstadosFiltro() {
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
    }

    // ===========================
    // FUNCIONES DE FILTRADO
    // ===========================

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
    function verDetalleReporte(id) {
        console.log('👁️ Ver detalles del reporte:', id);
        // Usar navegación SPA si está disponible
        if (window.spaNav) {
            window.spaNav.navigateTo('detalle-reporte', `?id=${id}`);
        } else {
            // Fallback a navegación tradicional
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
    }

    // Configurar eventos
    $('.filtro-buscar').on('input', aplicarFiltros);
    $('#filtro-categoria, #filtro-estado, #filtro-fecha').on('change', aplicarFiltros);
    
    // Configurar navegación para el botón "Nuevo reporte"
    $(document).on('click', 'a[data-page="new-report"]', function(e) {
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

// Función global para recargar datos
window.recargarReportes = function() {
    console.log('🔄 MANUAL: Recargando reportes...');
    if (typeof cargarReportes === 'function') {
        cargarReportes();
    } else {
        console.error('❌ Función cargarReportes no disponible');
    }
};

// Función global para manejar explorar reportes desde SPA
window.manejarExplorarReportes = function() {
    console.log('🔄 SPA: Recargando datos de Explorar Reportes...');
    
    // Pequeño retraso para la navegación SPA
    setTimeout(() => {
        if (typeof cargarReportes === 'function') {
            cargarReportes();
            cargarCategoriasFiltro();
            cargarEstadosFiltro();
        } else {
            console.error('❌ Funciones no disponibles para SPA');
        }
    }, 150);
};

// Alias para compatibilidad
window.recargarExplorarReportes = window.manejarExplorarReportes;

// Exportar funciones para uso global si es necesario
window.ExplorarReportes = {
    actualizarTabla: function(nuevosReportes) {
        todosLosReportes.length = 0;
        todosLosReportes.push(...nuevosReportes);
        aplicarFiltros();
    }
};