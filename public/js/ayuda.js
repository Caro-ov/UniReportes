$(document).ready(function() {
    // Toggle del menú desplegable
    $('.avatar-usuario').click(function(e) {
        e.stopPropagation();
        $('.menu-desplegable').toggleClass('mostrar');
    });

    // Cerrar menú al hacer clic fuera
    $(document).click(function() {
        $('.menu-desplegable').removeClass('mostrar');
    });

    // Evitar detener la propagación aquí para no bloquear los handlers globales (p.ej. logout)
    $('.menu-desplegable').click(function(e) {
        // Intencionalmente no se llama a e.stopPropagation() para permitir delegación global
    });
});