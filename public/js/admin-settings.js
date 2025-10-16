$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    console.log('Configuración Administrativa JavaScript inicializado');
    
    // ===========================
    // INTERACCIONES
    // ===========================
    
    // Manejar clicks en tarjetas de configuración
    $('.tarjeta-config').on('click', function() {
        const $tarjeta = $(this);
        
        // Efecto visual
        $tarjeta.addClass('activa');
        setTimeout(() => $tarjeta.removeClass('activa'), 200);
    });
    
    // Manejar clicks en botones de configuración
    $('.boton-config-secundario').on('click', function(e) {
        e.stopPropagation();
        const texto = $(this).text().trim();
        
        mostrarToast(`Función "${texto}" en desarrollo`, 'info');
    });
    
    // ===========================
    // FUNCIONES AUXILIARES
    // ===========================
    
    function mostrarToast(mensaje, tipo = 'info') {
        const toast = $(`
            <div class="toast toast-${tipo}">
                <span class="material-symbols-outlined">info</span>
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
    
    console.log('Configuración Administrativa completamente cargado');
});