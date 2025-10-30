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
    // FUNCIONALIDAD DE LA PÁGINA
    // ===========================
    
    // Variables para los filtros
    let filtroActual = {
        busqueda: '',
        categoria: '',
        estado: '',
        fecha: ''
    };

    // Función principal de filtrado
    function aplicarFiltros() {
        $('.fila-reporte').each(function() {
            const fila = $(this);
            let mostrar = true;

            // Filtro por búsqueda
            if (filtroActual.busqueda) {
                const textoReporte = fila.find('.celda-asunto').text().toLowerCase();
                const idReporte = fila.find('.celda-id').text().toLowerCase();
                const termino = filtroActual.busqueda.toLowerCase();
                
                if (!textoReporte.includes(termino) && !idReporte.includes(termino)) {
                    mostrar = false;
                }
            }

            // Filtro por estado
            if (filtroActual.estado && mostrar) {
                const estadoBadge = fila.find('.estado-badge');
                let coincideEstado = false;
                
                switch(filtroActual.estado) {
                    case 'enviado':
                        coincideEstado = estadoBadge.hasClass('estado-enviado');
                        break;
                    case 'revisado':
                        coincideEstado = estadoBadge.hasClass('estado-revisado');
                        break;
                    case 'proceso':
                        coincideEstado = estadoBadge.hasClass('estado-proceso');
                        break;
                    case 'resuelto':
                        coincideEstado = estadoBadge.hasClass('estado-resuelto');
                        break;
                }
                
                if (!coincideEstado) {
                    mostrar = false;
                }
            }

            // Filtro por fecha
            if (filtroActual.fecha && mostrar) {
                const fechaReporte = new Date(fila.find('.celda-fecha').text());
                const hoy = new Date();
                let coincideFecha = false;

                switch(filtroActual.fecha) {
                    case 'hoy':
                        coincideFecha = fechaReporte.toDateString() === hoy.toDateString();
                        break;
                    case 'semana':
                        const inicioSemana = new Date(hoy);
                        inicioSemana.setDate(hoy.getDate() - 7);
                        coincideFecha = fechaReporte >= inicioSemana;
                        break;
                    case 'mes':
                        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                        coincideFecha = fechaReporte >= inicioMes;
                        break;
                    case 'trimestre':
                        const inicioTrimestre = new Date(hoy);
                        inicioTrimestre.setMonth(hoy.getMonth() - 3);
                        coincideFecha = fechaReporte >= inicioTrimestre;
                        break;
                }
                
                if (!coincideFecha) {
                    mostrar = false;
                }
            }

            // Mostrar u ocultar la fila
            if (mostrar) {
                fila.show();
            } else {
                fila.hide();
            }
        });

        // Actualizar contador de resultados
        actualizarContadorResultados();
    }

    // Función para actualizar el contador de resultados
    function actualizarContadorResultados() {
        const totalReportes = $('.fila-reporte').length;
        const reportesVisibles = $('.fila-reporte:visible').length;
        
        // Actualizar estadísticas dinámicamente
        actualizarEstadisticas();
        
        if (reportesVisibles !== totalReportes) {
            $('.titulo-tabla').text(`Reportes Recientes (${reportesVisibles} de ${totalReportes})`);
        } else {
            $('.titulo-tabla').text('Reportes Recientes');
        }
    }

    // Función para actualizar las estadísticas de las tarjetas
    function actualizarEstadisticas() {
        const totalReportes = $('.fila-reporte').length;
        let enviados = 0;
        let revision = 0;
        let proceso = 0;
        let resueltos = 0;

        $('.fila-reporte').each(function() {
            const estadoBadge = $(this).find('.estado-badge');
            
            if (estadoBadge.hasClass('estado-enviado')) {
                enviados++;
            } else if (estadoBadge.hasClass('estado-revisado')) {
                revision++;
            } else if (estadoBadge.hasClass('estado-proceso')) {
                proceso++;
            } else if (estadoBadge.hasClass('estado-resuelto')) {
                resueltos++;
            }
        });

        // Actualizar los números en las tarjetas
        $('#total-reportes').text(totalReportes);
        $('#reportes-enviados').text(enviados);
        $('#reportes-revision').text(revision);
        $('#reportes-proceso').text(proceso);
        $('#reportes-resueltos').text(resueltos);

        // Animación de conteo (opcional)
        animarContadores();
    }

    // Función para animar los contadores
    function animarContadores() {
        $('.numero-estadistica').each(function() {
            const $this = $(this);
            const countTo = parseInt($this.text());
            
            $({ countNum: 0 }).animate({
                countNum: countTo
            }, {
                duration: 800,
                easing: 'swing',
                step: function() {
                    $this.text(Math.floor(this.countNum));
                },
                complete: function() {
                    $this.text(this.countNum);
                }
            });
        });
    }

    // Event listeners para los filtros
    $('#buscarReportes').on('input', function() {
        filtroActual.busqueda = $(this).val();
        aplicarFiltros();
    });

    $('#filtroCategoria').on('change', function() {
        filtroActual.categoria = $(this).val();
        aplicarFiltros();
    });

    $('#filtroEstado').on('change', function() {
        filtroActual.estado = $(this).val();
        aplicarFiltros();
    });

    $('#filtroFecha').on('change', function() {
        filtroActual.fecha = $(this).val();
        aplicarFiltros();
    });

    // Función para limpiar todos los filtros
    function limpiarFiltros() {
        filtroActual = {
            busqueda: '',
            categoria: '',
            estado: '',
            fecha: ''
        };
        
        $('#buscarReportes').val('');
        $('#filtroCategoria').val('');
        $('#filtroEstado').val('');
        $('#filtroFecha').val('');
        
        aplicarFiltros();
    }

    // Funcionalidad del botón "Nuevo Reporte" - REMOVIDO

    // Filtros y búsqueda de reportes (código legacy mantenido para compatibilidad)
    $('#search-input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterReports(searchTerm);
    });

    $('.filter-button').on('click', function() {
        const filterType = $(this).data('filter');
        applyFilter(filterType);
        
        // Actualizar estado visual de los botones
        $('.filter-button').removeClass('active');
        $(this).addClass('active');
    });

    // Función para filtrar reportes (legacy)
    function filterReports(searchTerm) {
        $('.report-item').each(function() {
            const reportText = $(this).text().toLowerCase();
            if (reportText.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Función para aplicar filtros (legacy)
    function applyFilter(filterType) {
        $('.report-item').each(function() {
            const reportStatus = $(this).find('.estado').text().toLowerCase();
            
            if (filterType === 'all') {
                $(this).show();
            } else if (filterType === 'pending' && reportStatus.includes('pendiente')) {
                $(this).show();
            } else if (filterType === 'in-progress' && reportStatus.includes('proceso')) {
                $(this).show();
            } else if (filterType === 'completed' && reportStatus.includes('completado')) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Manejar clics en reportes para ir al detalle
    $('.fila-reporte').on('click', '.enlace-accion', function(e) {
        e.preventDefault();
        const reportId = $(this).closest('.fila-reporte').find('.celda-id').text().replace('#', '');
        if (reportId) {
            window.location.href = `detalle-reporte.html?id=${reportId}`;
        }
    });

    // Inicialización
    $(document).ready(function() {
        // Cargar estadísticas iniciales
        actualizarEstadisticas();
        // Aplicar filtros iniciales
        aplicarFiltros();
    });
});