$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    console.log('Crear Usuario JavaScript inicializado');
    
    // ===========================
    // VALIDACIÓN DEL FORMULARIO
    // ===========================
    
    // Validación en tiempo real
    $('.campo-entrada').on('input blur', function() {
        validarCampo($(this));
    });
    
    // Manejar cambios en el rol para mostrar/ocultar campos
    $('#rol').on('change', function() {
        const rol = $(this).val();
        manejarCambioRol(rol);
    });
    
    // Manejar envío del formulario
    $('#formulario-usuario').on('submit', function(e) {
        e.preventDefault();
        enviarFormulario();
    });
    
    // ===========================
    // FUNCIONES DE VALIDACIÓN
    // ===========================
    
    function validarCampo($campo) {
        const valor = $campo.val().trim();
        const tipo = $campo.attr('type');
        const nombre = $campo.attr('name');
        const esRequerido = $campo.prop('required');
        
        // Limpiar estado anterior
        $campo.removeClass('valido invalido');
        $campo.closest('.campo-formulario').removeClass('error');
        
        // Validar si es requerido
        if (esRequerido && !valor) {
            marcarCampoInvalido($campo, 'Este campo es obligatorio');
            return false;
        }
        
        // Validaciones específicas por tipo
        switch (tipo) {
            case 'email':
                if (valor && !validarEmail(valor)) {
                    marcarCampoInvalido($campo, 'Ingrese un email válido');
                    return false;
                }
                break;
                
            case 'tel':
                if (valor && !validarTelefono(valor)) {
                    marcarCampoInvalido($campo, 'Ingrese un teléfono válido');
                    return false;
                }
                break;
        }
        
        // Validaciones específicas por nombre
        switch (nombre) {
            case 'codigo_estudiante':
                if (valor && !validarCodigoEstudiante(valor)) {
                    marcarCampoInvalido($campo, 'Formato: YYYY######');
                    return false;
                }
                break;
                
            case 'nombre':
                if (valor && valor.length < 2) {
                    marcarCampoInvalido($campo, 'El nombre debe tener al menos 2 caracteres');
                    return false;
                }
                break;
        }
        
        // Si llegó hasta aquí, el campo es válido
        if (valor) {
            marcarCampoValido($campo);
        }
        return true;
    }
    
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function validarTelefono(telefono) {
        const regex = /^[\d\s\-\+\(\)]+$/;
        return telefono.length >= 7 && regex.test(telefono);
    }
    
    function validarCodigoEstudiante(codigo) {
        const regex = /^\d{4}\d{6}$/;
        return regex.test(codigo);
    }
    
    function marcarCampoValido($campo) {
        $campo.addClass('valido');
        $campo.closest('.campo-formulario').removeClass('error');
    }
    
    function marcarCampoInvalido($campo, mensaje) {
        $campo.addClass('invalido');
        const $contenedor = $campo.closest('.campo-formulario');
        $contenedor.addClass('error');
        
        // Crear o actualizar mensaje de error
        let $mensajeError = $contenedor.find('.mensaje-error');
        if ($mensajeError.length === 0) {
            $mensajeError = $('<div class="mensaje-error"></div>');
            $contenedor.append($mensajeError);
        }
        $mensajeError.text(mensaje);
    }
    
    // ===========================
    // MANEJO DE ROLES
    // ===========================
    
    function manejarCambioRol(rol) {
        const $codigoEstudiante = $('#codigo_estudiante').closest('.campo-formulario');
        const $facultad = $('#facultad').closest('.campo-formulario');
        const $permisosAdmin = $('#es_administrador').closest('.permiso-item');
        
        // Mostrar/ocultar código de estudiante
        if (rol === 'estudiante') {
            $codigoEstudiante.show();
            $('#codigo_estudiante').prop('required', true);
        } else {
            $codigoEstudiante.hide();
            $('#codigo_estudiante').prop('required', false);
        }
        
        // Manejar permisos según rol
        switch (rol) {
            case 'administrador':
                $permisosAdmin.show();
                $('#es_administrador').prop('checked', true);
                $('#puede_editar_reportes').prop('checked', true);
                $('#puede_eliminar_reportes').prop('checked', true);
                break;
                
            case 'monitor':
                $permisosAdmin.hide();
                $('#es_administrador').prop('checked', false);
                $('#puede_editar_reportes').prop('checked', true);
                $('#puede_eliminar_reportes').prop('checked', false);
                break;
                
            default:
                $permisosAdmin.hide();
                $('#es_administrador').prop('checked', false);
                $('#puede_editar_reportes').prop('checked', false);
                $('#puede_eliminar_reportes').prop('checked', false);
        }
    }
    
    // ===========================
    // ENVÍO DEL FORMULARIO
    // ===========================
    
    function enviarFormulario() {
        // Validar todos los campos
        let formularioValido = true;
        $('.campo-entrada').each(function() {
            if (!validarCampo($(this))) {
                formularioValido = false;
            }
        });
        
        if (!formularioValido) {
            mostrarToast('Por favor, corrija los errores en el formulario', 'error');
            return;
        }
        
        // Recopilar datos del formulario
        const datosUsuario = recopilarDatosFormulario();
        
        // Simular envío (aquí iría la llamada AJAX real)
        mostrarToast('Creando usuario...', 'info');
        
        setTimeout(() => {
            // Simular respuesta exitosa
            mostrarToast('Usuario creado exitosamente', 'success');
            
            // Limpiar formulario después de un delay
            setTimeout(() => {
                limpiarFormulario();
            }, 1500);
            
        }, 2000);
    }
    
    function recopilarDatosFormulario() {
        const permisos = [];
        $('input[name="permisos[]"]:checked').each(function() {
            permisos.push($(this).val());
        });
        
        return {
            nombre: $('#nombre').val(),
            email: $('#email').val(),
            telefono: $('#telefono').val(),
            rol: $('#rol').val(),
            facultad: $('#facultad').val(),
            codigo_estudiante: $('#codigo_estudiante').val(),
            permisos: permisos
        };
    }
    
    function limpiarFormulario() {
        $('#formulario-usuario')[0].reset();
        $('.campo-entrada').removeClass('valido invalido');
        $('.campo-formulario').removeClass('error');
        $('.mensaje-error').remove();
        
        // Ocultar campos específicos
        $('#codigo_estudiante').closest('.campo-formulario').hide();
        $('#es_administrador').closest('.permiso-item').hide();
    }
    
    // ===========================
    // FUNCIONES AUXILIARES
    // ===========================
    
    function mostrarToast(mensaje, tipo = 'info') {
        const toast = $(`
            <div class="toast toast-${tipo}">
                <span class="material-symbols-outlined">
                    ${getTipoIcon(tipo)}
                </span>
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
    
    function getTipoIcon(tipo) {
        switch(tipo) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'info': return 'info';
            default: return 'info';
        }
    }
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    // Configurar estado inicial
    $('#codigo_estudiante').closest('.campo-formulario').hide();
    $('#es_administrador').closest('.permiso-item').hide();
    
    // Enfocar primer campo
    $('#nombre').focus();
    
    console.log('Crear Usuario completamente inicializado');
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para volver al panel de administración
function volverAlPanel() {
    window.location.href = 'admin-dashboard.html';
}