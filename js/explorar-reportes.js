// Sistema de gestión de explorar reportes
$(document).ready(function() {
    
    // Datos de reportes (simulados)
    const reportesData = [
        {
            id: '#12345',
            categoria: 'electrico',
            estado: 'abierto',
            usuario: 'Carlos López',
            fecha: '2024-07-26',
            responsable: 'Sin asignar'
        },
        {
            id: '#12346',
            categoria: 'fontaneria',
            estado: 'en-proceso',
            usuario: 'Ana García',
            fecha: '2024-07-25',
            responsable: 'Juan Pérez'
        },
        {
            id: '#12347',
            categoria: 'estructural',
            estado: 'resuelto',
            usuario: 'Sofía Martínez',
            fecha: '2024-07-24',
            responsable: 'Pedro Ramírez'
        },
        {
            id: '#12348',
            categoria: 'climatizacion',
            estado: 'abierto',
            usuario: 'Diego Fernández',
            fecha: '2024-07-23',
            responsable: 'Sin asignar'
        },
        {
            id: '#12349',
            categoria: 'seguridad',
            estado: 'en-proceso',
            usuario: 'Laura Sánchez',
            fecha: '2024-07-22',
            responsable: 'María Gómez'
        },
        {
            id: '#12350',
            categoria: 'electrico',
            estado: 'resuelto',
            usuario: 'Roberto Silva',
            fecha: '2024-07-21',
            responsable: 'Carmen Torres'
        },
        {
            id: '#12351',
            categoria: 'fontaneria',
            estado: 'abierto',
            usuario: 'Elena Rodriguez',
            fecha: '2024-07-20',
            responsable: 'Sin asignar'
        }
    ];

    let reportesFiltrados = [...reportesData];

    // Función para renderizar la tabla de reportes
    function renderizarTabla(reportes) {
        const tbody = $('#tabla-reportes-body');
        tbody.empty();

        if (reportes.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        No se encontraron reportes que coincidan con los filtros seleccionados.
                    </td>
                </tr>
            `);
            return;
        }

        reportes.forEach(reporte => {
            const estadoClass = {
                'abierto': 'estado-abierto',
                'en-proceso': 'estado-proceso',
                'resuelto': 'estado-resuelto'
            }[reporte.estado];

            const estadoTexto = {
                'abierto': 'Abierto',
                'en-proceso': 'En Proceso',
                'resuelto': 'Resuelto'
            }[reporte.estado];

            const categoriaTexto = {
                'electrico': 'Eléctrico',
                'fontaneria': 'Fontanería',
                'estructural': 'Estructural',
                'climatizacion': 'Climatización',
                'seguridad': 'Seguridad'
            }[reporte.categoria];

            tbody.append(`
                <tr data-reporte-id="${reporte.id}">
                    <td class="id-reporte">${reporte.id}</td>
                    <td class="categoria">${categoriaTexto}</td>
                    <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
                    <td>${reporte.usuario}</td>
                    <td>${reporte.fecha}</td>
                    <td>${reporte.responsable}</td>
                    <td class="acciones">
                        <button class="btn-accion btn-ver" title="Ver detalles" data-action="ver" data-id="${reporte.id}">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="btn-accion btn-editar" title="Editar" data-action="editar" data-id="${reporte.id}">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn-accion btn-eliminar" title="Eliminar" data-action="eliminar" data-id="${reporte.id}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    // Función para aplicar filtros
    function aplicarFiltros() {
        const busqueda = $('.filtro-buscar').val().toLowerCase();
        const categoriaFiltro = $('#filtro-categoria').val();
        const estadoFiltro = $('#filtro-estado').val();
        const fechaFiltro = $('#filtro-fecha').val();

        reportesFiltrados = reportesData.filter(reporte => {
            const coincideBusqueda = !busqueda || 
                reporte.id.toLowerCase().includes(busqueda) ||
                reporte.usuario.toLowerCase().includes(busqueda) ||
                reporte.responsable.toLowerCase().includes(busqueda);

            const coincideCategoria = !categoriaFiltro || reporte.categoria === categoriaFiltro;
            const coincideEstado = !estadoFiltro || reporte.estado === estadoFiltro;
            
            let coincideFecha = true;
            if (fechaFiltro) {
                const fechaReporte = new Date(reporte.fecha);
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
        actualizarGraficos();
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
        // Redirigir a la página de detalle del reporte
        window.location.href = `detalle-reporte.html?id=${id.replace('#', '')}`;
    }

    function editarReporte(id) {
        // Redirigir a la página de edición del reporte
        window.location.href = `crear-reporte.html?edit=${id.replace('#', '')}`;
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

// Exportar funciones para uso global si es necesario
window.ExplorarReportes = {
    actualizarTabla: function(nuevosReportes) {
        reportesData.length = 0;
        reportesData.push(...nuevosReportes);
        aplicarFiltros();
    }
};