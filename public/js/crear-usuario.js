// ===========================
// MÓDULO CREAR USUARIO
// ===========================

window.CrearUsuario = (function() {
    
    // Variables del módulo
    let formularioEnviado = false;
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    function init() {
        console.log('🆕 Inicializando módulo Crear Usuario');
        
        // Verificar autenticación de forma asíncrona
        verificarAutenticacion().then(isAuthorized => {
            if (!isAuthorized) {
                return;
            }
            
            // Si está autorizado, continuar con la inicialización
            // Configurar eventos
            configurarEventos();
            
            // Configurar validaciones
            configurarValidaciones();
            
            // Enfocar primer campo
            $('#nombre').focus();
            
            console.log('✅ Módulo Crear Usuario inicializado correctamente');
        }).catch(error => {
            console.error('💥 Error durante la inicialización:', error);
        });
    }
    
    function cleanup() {
        console.log('🧹 Limpiando módulo Crear Usuario');
        
        // Limpiar eventos
        $('#formulario-usuario').off('.crearusuario');
        $('#btn-cancelar').off('.crearusuario');
        $('.campo-entrada').off('.crearusuario');
        $('#rol').off('.crearusuario');
        
        // Resetear variables
        formularioEnviado = false;
    }
    
    // ===========================
    // VERIFICACIÓN DE AUTENTICACIÓN
    // ===========================
    
    async function verificarAutenticacion() {
        try {
            console.log('🔐 Verificando autenticación del usuario...');
            
            // Hacer petición al servidor para obtener el perfil del usuario actual
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('❌ No se pudo obtener el perfil del usuario:', response.status);
                mostrarToast('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
                
                setTimeout(() => {
                    if (window.spaNav) {
                        window.spaNav.navigateTo('login');
                    } else {
                        window.location.href = '/login.html';
                    }
                }, 2000);
                
                return false;
            }
            
            const userData = await response.json();
            console.log('👤 Datos del usuario obtenidos:', userData);
            
            // Extraer los datos del usuario de la respuesta
            const user = userData.data || userData;
            console.log('🔍 Datos del usuario procesados:', user);
            
            // Verificar que el usuario tiene permisos de administrador
            if (user.rol !== 'admin') {
                console.error('❌ Acceso denegado: Se requieren permisos de administrador');
                console.log('📋 Rol actual del usuario:', user.rol);
                mostrarToast('No tienes permisos para crear usuarios. Solo los administradores pueden acceder a esta función.', 'error');
                
                // Redirigir según el rol
                setTimeout(() => {
                    if (window.spaNav) {
                        if (user.rol === 'monitor') {
                            window.spaNav.navigateTo('dashboard');
                        } else {
                            window.spaNav.navigateTo('login');
                        }
                    }
                }, 3000);
                
                return false;
            }
            
            console.log('✅ Usuario autenticado como administrador');
            return true;
            
        } catch (error) {
            console.error('💥 Error al verificar autenticación:', error);
            mostrarToast('Error de conexión. Por favor, intenta nuevamente.', 'error');
            
            setTimeout(() => {
                if (window.spaNav) {
                    window.spaNav.navigateTo('login');
                }
            }, 2000);
            
            return false;
        }
    }
    
    // ===========================
    // CONFIGURACIÓN DE EVENTOS
    // ===========================
    
    function configurarEventos() {
        // Evento para envío del formulario
        $('#formulario-usuario').on('submit.crearusuario', function(e) {
            e.preventDefault();
            enviarFormulario();
        });
        
        // Evento para cancelar
        $('#btn-cancelar').on('click.crearusuario', function() {
            cancelarCreacion();
        });
        
        // Evento para cambio de rol
        $('#rol').on('change.crearusuario', function() {
            const rol = $(this).val();
            manejarCambioRol(rol);
        });
    }
    
    function configurarValidaciones() {
        // Validación en tiempo real
        $('.campo-entrada').on('input.crearusuario blur.crearusuario', function() {
            validarCampo($(this));
        });
    }
    
    // ===========================
    // MANEJO DE ROLES
    // ===========================
    
    function manejarCambioRol(rol) {
        const $codigoEstudiante = $('#codigo_estudiante').closest('.campo-formulario');
        
        // El código de estudiante es opcional para ambos roles
        // Pero lo mostramos siempre
        $codigoEstudiante.show();
        
        // Agregar información sobre el rol seleccionado
        mostrarInfoRol(rol);
    }
    
    function mostrarInfoRol(rol) {
        // Remover información anterior
        $('.info-rol').remove();
        
        let mensaje = '';
        let icono = '';
        
        switch (rol) {
            case 'monitor':
                mensaje = 'Los monitores pueden ver y crear reportes';
                icono = 'visibility';
                break;
            case 'admin':
                mensaje = 'Los administradores tienen acceso completo al sistema';
                icono = 'admin_panel_settings';
                break;
        }
        
        if (mensaje) {
            const infoHtml = `
                <div class="info-rol" style="margin-top: 0.5rem; padding: 0.75rem; background: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="material-symbols-outlined" style="color: #0284c7; font-size: 1.2rem;">${icono}</span>
                    <span style="color: #075985; font-size: 0.9rem;">${mensaje}</span>
                </div>
            `;
            $('#rol').closest('.campo-formulario').append(infoHtml);
        }
    }
    
    // ===========================
    // VALIDACIONES
    // ===========================
    
    function validarCampo($campo) {
        const valor = $campo.val().trim();
        const nombre = $campo.attr('name');
        const esRequerido = $campo.prop('required');
        
        // Limpiar estado anterior
        $campo.removeClass('valido invalido');
        $campo.closest('.campo-formulario').removeClass('error');
        $('.mensaje-error').remove();
        
        // Validar si es requerido
        if (esRequerido && !valor) {
            marcarCampoInvalido($campo, 'Este campo es obligatorio');
            return false;
        }
        
        // Validaciones específicas
        switch (nombre) {
            case 'nombre':
                if (valor && valor.length < 2) {
                    marcarCampoInvalido($campo, 'El nombre debe tener al menos 2 caracteres');
                    return false;
                }
                break;
                
            case 'email':
                if (valor && !validarEmail(valor)) {
                    marcarCampoInvalido($campo, 'Formato de correo electrónico inválido');
                    return false;
                }
                break;
                
            case 'contrasena':
                if (valor && valor.length < 6) {
                    marcarCampoInvalido($campo, 'La contraseña debe tener al menos 6 caracteres');
                    return false;
                }
                break;
                
            case 'codigo_estudiante':
                if (valor && !validarCodigoEstudiante(valor)) {
                    marcarCampoInvalido($campo, 'Formato de código inválido (Ej: 2024001234)');
                    return false;
                }
                break;
        }
        
        // Si llegamos aquí, el campo es válido
        if (valor) {
            marcarCampoValido($campo);
        }
        
        return true;
    }
    
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function validarCodigoEstudiante(codigo) {
        const regex = /^\d{10}$/;
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
        
        // Crear mensaje de error
        const $mensajeError = $('<div class="mensaje-error" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;">' + mensaje + '</div>');
        $contenedor.append($mensajeError);
    }
    
    // ===========================
    // ENVÍO DEL FORMULARIO
    // ===========================
    
    async function enviarFormulario() {
        if (formularioEnviado) {
            return; // Prevenir doble envío
        }
        
        console.log('📤 Iniciando envío de formulario');
        
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
        
        // Recopilar datos
        const datosUsuario = recopilarDatosFormulario();
        console.log('📋 Datos recopilados:', datosUsuario);
        
        // Marcar como enviado y deshabilitar botón
        formularioEnviado = true;
        const $btnCrear = $('.boton-crear');
        const textoOriginal = $btnCrear.html();
        $btnCrear.prop('disabled', true).html('<span class="material-symbols-outlined">sync</span> Creando...');
        
        try {
            // Realizar petición al servidor
            const response = await fetch('/api/users', {
                method: 'POST',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear usuario');
            }
            
            const result = await response.json();
            console.log('✅ Usuario creado exitosamente:', result);
            
            // Mostrar mensaje de éxito
            mostrarToast('Usuario creado exitosamente', 'success');
            
            // Limpiar formulario después de un delay
            setTimeout(() => {
                limpiarFormulario();
                
                // Redirigir a ver usuarios
                if (window.spaNav) {
                    window.spaNav.navigateTo('ver-usuarios');
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            mostrarToast(error.message || 'Error al crear usuario', 'error');
        } finally {
            // Restaurar botón
            formularioEnviado = false;
            $btnCrear.prop('disabled', false).html(textoOriginal);
        }
    }
    
    function recopilarDatosFormulario() {
        return {
            nombre: $('#nombre').val().trim(),
            correo: $('#email').val().trim(),
            contrasena: $('#contrasena').val(),
            rol: $('#rol').val(),
            codigo: $('#codigo_estudiante').val().trim() || null
        };
    }
    
    function limpiarFormulario() {
        $('#formulario-usuario')[0].reset();
        $('.campo-entrada').removeClass('valido invalido');
        $('.campo-formulario').removeClass('error');
        $('.mensaje-error').remove();
        $('.info-rol').remove();
        $('#nombre').focus();
    }
    
    // ===========================
    // FUNCIONES AUXILIARES
    // ===========================
    
    function cancelarCreacion() {
        if (formularioEnviado) {
            mostrarToast('Espere mientras se completa la operación', 'info');
            return;
        }
        
        // Verificar si hay cambios sin guardar
        const hayCambios = $('#nombre').val() || $('#email').val() || $('#contrasena').val() || $('#rol').val();
        
        if (hayCambios) {
            if (!confirm('¿Está seguro de que desea cancelar? Se perderán todos los datos ingresados.')) {
                return;
            }
        }
        
        // Redirigir usando SPA
        if (window.spaNav) {
            window.spaNav.navigateTo('ver-usuarios');
        }
    }
    
    function mostrarToast(mensaje, tipo = 'info') {
        const iconos = {
            success: 'check_circle',
            error: 'error',
            info: 'info',
            warning: 'warning'
        };
        
        const toast = $(`
            <div class="toast toast-${tipo}" style="position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 0.75rem; opacity: 0; transform: translateX(100%); transition: all 0.3s ease;">
                <span class="material-symbols-outlined" style="color: ${getTipoColor(tipo)}; font-size: 1.5rem;">
                    ${iconos[tipo] || 'info'}
                </span>
                <span style="color: #374151; font-weight: 500;">${mensaje}</span>
            </div>
        `);
        
        $('body').append(toast);
        
        setTimeout(() => {
            toast.css({
                opacity: '1',
                transform: 'translateX(0)'
            });
        }, 100);
        
        setTimeout(() => {
            toast.css({
                opacity: '0',
                transform: 'translateX(100%)'
            });
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    function getTipoColor(tipo) {
        switch(tipo) {
            case 'success': return '#059669';
            case 'error': return '#dc2626';
            case 'warning': return '#d97706';
            case 'info': return '#2563eb';
            default: return '#6b7280';
        }
    }
    
    // ===========================
    // API PÚBLICA
    // ===========================
    
    return {
        init: init,
        cleanup: cleanup
    };
    
})(); // IIFE para crear el módulo

// ===========================
// INICIALIZACIÓN AUTOMÁTICA
// ===========================

$(document).ready(function() {
    // Solo inicializar si estamos en la página correcta
    if ($('body[data-page="create-user"]').length > 0) {
        console.log('🚀 Página de crear usuario detectada, inicializando módulo');
        window.CrearUsuario.init();
    }
});

// Verificar que el módulo se cargó correctamente
console.log('✅ Módulo CrearUsuario cargado:', typeof window.CrearUsuario);