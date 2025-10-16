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
    
    // Filtros y búsqueda de reportes
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

    // Función para filtrar reportes
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

    // Función para aplicar filtros
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
    $('.report-item').on('click', function() {
        const reportId = $(this).data('report-id');
        if (reportId) {
            window.location.href = `detalle-reporte.html?id=${reportId}`;
        }
    });
});