$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    // Variables globales
    let archivoSeleccionado = null;
    let validacionEnTiempoReal = true;
    
    // Configurar fecha y hora actuales por defecto
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().slice(0, 5);
    
    $('#date').val(fechaHoy);
    $('#time').val(horaActual);
    
    // ===========================
    // NAVEGACIÓN SIDEBAR
    // ===========================
    
    // Manejar navegación en sidebar (igual que dashboard pero con nav activo en crear-reporte)
    $('.nav-item').on('click', function(e) {
        e.preventDefault();
        
        const $item = $(this);
        const texto = $item.find('.nav-text').text().trim();
        
        // Remover clase activa de todos los elementos
        $('.nav-item').removeClass('active');
        
        // Agregar clase activa al elemento clickeado
        $item.addClass('active');
        
        // Determinar destino
        let destino = '';
        
        switch(texto) {
            case 'Inicio':
                destino = 'dashboard.html';
                break;
            case 'Mis reportes':
                destino = 'mis-reportes.html';
                break;
            case 'Nuevo reporte':
                destino = 'crear-reporte.html';
                break;
            case 'Ayuda':
                destino = 'ayuda.html';
                break;
            default:
                destino = 'dashboard.html';
        }
        
        // Si es la misma página, no redirigir
        if (destino === 'crear-reporte.html') {
            return;
        }
        
        // Verificar si hay cambios sin guardar
        if (hayCanibiosSinGuardar()) {
            mostrarDialogoSalida(destino);
        } else {
            window.location.href = destino;
        }
    });
    
    // ===========================
    // VALIDACIONES DEL FORMULARIO
    // ===========================
    
    // Validación del tipo de problema
    $('#problem-type').on('change', function() {
        const valor = $(this).val();
        
        if (valor) {
            $(this).removeClass('error').addClass('valido');
            ocultarError('problem-type');
            
            // Si selecciona "Otro", hacer descripción obligatoria
            if (valor === 'otro') {
                $('#description').attr('required', true);
                $('.etiqueta-campo[for="description"]').html('Descripción <span class="requerido">*</span>');
            } else {
                $('#description').removeAttr('required');
                $('.etiqueta-campo[for="description"]').text('Descripción (opcional)');
            }
        } else {
            $(this).removeClass('valido').addClass('error');
            mostrarError('problem-type', 'Por favor selecciona un tipo de problema');
        }
    });
    
    // Validación de ubicación
    $('#location').on('input blur', function() {
        const valor = $(this).val().trim();
        
        if (valor.length >= 3) {
            $(this).removeClass('error').addClass('valido');
            ocultarError('location');
        } else if (valor.length > 0) {
            $(this).removeClass('valido').addClass('error');
            mostrarError('location', 'La ubicación debe tener al menos 3 caracteres');
        } else {
            $(this).removeClass('valido error');
            mostrarError('location', 'La ubicación es obligatoria');
        }
    });
    
    // Validación de fecha
    $('#date').on('change', function() {
        const fecha = new Date($(this).val());
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fecha <= hoy) {
            $(this).removeClass('error').addClass('valido');
            ocultarError('date');
        } else {
            $(this).removeClass('valido').addClass('error');
            mostrarError('date', 'La fecha no puede ser en el futuro');
        }
    });
    
    // Validación de hora
    $('#time').on('change', function() {
        const horaSeleccionada = $(this).val();
        const fechaSeleccionada = $('#date').val();
        
        if (horaSeleccionada && fechaSeleccionada) {
            const fechaHora = new Date(fechaSeleccionada + 'T' + horaSeleccionada);
            const ahora = new Date();
            
            if (fechaHora <= ahora) {
                $(this).removeClass('error').addClass('valido');
                ocultarError('time');
            } else {
                $(this).removeClass('valido').addClass('error');
                mostrarError('time', 'La hora no puede ser en el futuro');
            }
        }
    });
    
    // Validación de descripción (cuando es requerida)
    $('#description').on('input', function() {
        const valor = $(this).val().trim();
        const esRequerida = $(this).attr('required');
        
        if (esRequerida && valor.length === 0) {
            $(this).removeClass('valido').addClass('error');
            mostrarError('description', 'La descripción es obligatoria para "Otro" tipo de problema');
        } else if (valor.length > 0 && valor.length < 10) {
            $(this).removeClass('valido').addClass('error');
            mostrarError('description', 'La descripción debe tener al menos 10 caracteres');
        } else if (valor.length >= 10 || (!esRequerida && valor.length === 0)) {
            $(this).removeClass('error').addClass('valido');
            ocultarError('description');
        }
    });
    
    // ===========================
    // MANEJO DE ARCHIVOS
    // ===========================
    
    // Configurar zona de arrastrar y soltar
    const $zonaSubida = $('.zona-subida-archivo');
    const $inputArchivo = $('#file-upload');
    
    // Eventos de drag and drop
    $zonaSubida.on('dragover dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('arrastrando');
    });
    
    $zonaSubida.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('arrastrando');
    });
    
    $zonaSubida.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('arrastrando');
        
        const archivos = e.originalEvent.dataTransfer.files;
        if (archivos.length > 0) {
            procesarArchivo(archivos[0]);
        }
    });
    
    // Cambio en input de archivo
    $inputArchivo.on('change', function() {
        if (this.files && this.files[0]) {
            procesarArchivo(this.files[0]);
        }
    });
    
    // Clic en zona de subida
    $zonaSubida.on('click', function() {
        $inputArchivo.click();
    });
    
    function procesarArchivo(archivo) {
        // Validar tipo de archivo
        const tiposImagenes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        const tiposVideos = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi', 'video/x-msvideo'];
        const tiposPermitidos = [...tiposImagenes, ...tiposVideos];
        
        if (!tiposPermitidos.includes(archivo.type)) {
            mostrarError('file-upload', 'Solo se permiten archivos de imagen (PNG, JPG, GIF) o video (MP4, MOV, AVI)');
            return;
        }
        
        // Validar tamaño (50MB máximo para videos, 10MB para imágenes)
        const esVideo = tiposVideos.includes(archivo.type);
        const tamanoMaximo = esVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB para video, 10MB para imagen
        
        if (archivo.size > tamanoMaximo) {
            const limiteTexto = esVideo ? '50MB' : '10MB';
            mostrarError('file-upload', 'El archivo no puede ser mayor a ' + limiteTexto);
            return;
        }
        
        // Archivo válido
        archivoSeleccionado = archivo;
        mostrarVistaPrevia(archivo);
        ocultarError('file-upload');
    }
    
    function mostrarVistaPrevia(archivo) {
        const esVideo = archivo.type.startsWith('video/');
        const reader = new FileReader();
        
        reader.onload = function(e) {
            let elementoPrevia;
            
            if (esVideo) {
                elementoPrevia = '<video class="video-previa" controls><source src="' + e.target.result + '" type="' + archivo.type + '">Tu navegador no soporta la reproducción de video.</video>';
            } else {
                elementoPrevia = '<img src="' + e.target.result + '" alt="Vista previa" class="imagen-previa">';
            }
            
            const contenidoPrevia = '<div class="vista-previa">' + elementoPrevia + '<div class="info-archivo"><div class="tipo-archivo"><span class="material-symbols-outlined">' + (esVideo ? 'videocam' : 'image') + '</span><span class="etiqueta-tipo">' + (esVideo ? 'Video' : 'Imagen') + '</span></div><p class="nombre-archivo">' + archivo.name + '</p><p class="tamano-archivo">' + formatearTamano(archivo.size) + '</p><div class="controles-archivo"><button type="button" class="boton-previsualizar"><span class="material-symbols-outlined">' + (esVideo ? 'play_circle' : 'zoom_in') + '</span>' + (esVideo ? 'Reproducir' : 'Ver completa') + '</button><button type="button" class="boton-eliminar-archivo"><span class="material-symbols-outlined">close</span>Eliminar</button></div></div></div>';
            
            $('.contenido-subida').html(contenidoPrevia);
            
            // Manejar eliminación
            $('.boton-eliminar-archivo').on('click', function(e) {
                e.stopPropagation();
                eliminarArchivo();
            });
            
            // Manejar previsualización completa
            $('.boton-previsualizar').on('click', function(e) {
                e.stopPropagation();
                mostrarPrevisualizacionCompleta(archivo, e.target.result);
            });
        };
        
        reader.readAsDataURL(archivo);
    }
    
    function eliminarArchivo() {
        archivoSeleccionado = null;
        $inputArchivo.val('');
        
        // Restaurar contenido original
        $('.contenido-subida').html('<svg class="icono-subida" fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg><div class="texto-subida"><label for="file-upload" class="enlace-subida"><span>Sube un archivo</span><input id="file-upload" name="file-upload" type="file" class="input-oculto"/></label><span class="texto-adicional">o arrastra y suelta</span></div><p class="texto-ayuda">PNG, JPG, GIF, MP4, MOV, AVI hasta 50MB</p>');
        
        // Re-asignar eventos
        $('#file-upload').on('change', function() {
            if (this.files && this.files[0]) {
                procesarArchivo(this.files[0]);
            }
        });
    }
    
    // Función para mostrar previsualización completa
    function mostrarPrevisualizacionCompleta(archivo, dataUrl) {
        const esVideo = archivo.type.startsWith('video/');
        
        let contenidoModal;
        
        if (esVideo) {
            contenidoModal = '<video class="video-modal" controls autoplay><source src="' + dataUrl + '" type="' + archivo.type + '">Tu navegador no soporta la reproducción de video.</video>';
        } else {
            contenidoModal = '<img src="' + dataUrl + '" alt="' + archivo.name + '" class="imagen-modal">';
        }
        
        const modal = $('<div class="modal-previsualizacion"><div class="overlay-modal"></div><div class="contenido-modal"><div class="header-modal"><h3>' + archivo.name + '</h3><button class="cerrar-modal"><span class="material-symbols-outlined">close</span></button></div><div class="cuerpo-modal">' + contenidoModal + '</div><div class="footer-modal"><div class="info-modal"><span class="material-symbols-outlined">' + (esVideo ? 'videocam' : 'image') + '</span><span>' + (esVideo ? 'Video' : 'Imagen') + ' • ' + formatearTamano(archivo.size) + '</span></div></div></div></div>');
        
        $('body').append(modal);
        
        // Mostrar modal
        setTimeout(function() {
            modal.addClass('mostrar');
        }, 10);
        
        // Cerrar modal
        modal.find('.cerrar-modal, .overlay-modal').on('click', function() {
            modal.removeClass('mostrar');
            setTimeout(function() {
                modal.remove();
            }, 300);
        });
        
        // Cerrar con Escape
        $(document).on('keydown.modal', function(e) {
            if (e.key === 'Escape') {
                modal.removeClass('mostrar');
                setTimeout(function() {
                    modal.remove();
                    $(document).off('keydown.modal');
                }, 300);
            }
        });
    }
    
    // ===========================
    // ENVÍO DEL FORMULARIO
    // ===========================
    
    $('.formulario-reporte').on('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            enviarReporte();
        }
    });
    
    function validarFormulario() {
        let esValido = true;
        
        // Validar tipo de problema
        if (!$('#problem-type').val()) {
            mostrarError('problem-type', 'Selecciona un tipo de problema');
            esValido = false;
        }
        
        // Validar ubicación
        const ubicacion = $('#location').val().trim();
        if (!ubicacion || ubicacion.length < 3) {
            mostrarError('location', 'La ubicación es obligatoria (mínimo 3 caracteres)');
            esValido = false;
        }
        
        // Validar fecha
        if (!$('#date').val()) {
            mostrarError('date', 'La fecha es obligatoria');
            esValido = false;
        }
        
        // Validar hora
        if (!$('#time').val()) {
            mostrarError('time', 'La hora es obligatoria');
            esValido = false;
        }
        
        // Validar descripción si es requerida
        const descripcion = $('#description').val().trim();
        const tipoProblema = $('#problem-type').val();
        
        if (tipoProblema === 'otro' && (!descripcion || descripcion.length < 10)) {
            mostrarError('description', 'Para "Otro" tipo de problema, la descripción es obligatoria (mínimo 10 caracteres)');
            esValido = false;
        }
        
        return esValido;
    }
    
    function enviarReporte() {
        const $botonEnvio = $('.boton-envio');
        const textoOriginal = $botonEnvio.text();
        
        // Deshabilitar botón y mostrar loading
        $botonEnvio.prop('disabled', true).addClass('cargando').html('<span class="material-symbols-outlined">sync</span> Enviando...');
        
        // Simular envío (reemplazar con llamada real a la API)
        setTimeout(function() {
            // Simular éxito (90% de probabilidad)
            if (Math.random() > 0.1) {
                mostrarExito();
            } else {
                mostrarErrorEnvio();
            }
        }, 2000);
    }
    
    function mostrarExito() {
        // Ocultar formulario y mostrar mensaje de éxito
        $('.tarjeta-formulario').addClass('ocultar');
        
        setTimeout(function() {
            $('.contenedor-formulario').html('<div class="mensaje-exito"><div class="icono-exito"><span class="material-symbols-outlined">check_circle</span></div><h2>¡Reporte enviado exitosamente!</h2><p>Tu reporte ha sido recibido y será revisado por nuestro equipo. Te notificaremos sobre cualquier actualización.</p><div class="numero-reporte"><strong>Número de reporte: #' + generarNumeroReporte() + '</strong></div><div class="acciones-exito"><button class="boton-secundario" onclick="window.location.href=\'mis-reportes.html\'">Ver mis reportes</button><button class="boton-principal" onclick="window.location.href=\'crear-reporte.html\'">Crear otro reporte</button></div></div>');
        }, 300);
        
        // Mostrar toast de confirmación
        setTimeout(function() {
            mostrarToast('¡Reporte creado exitosamente!', 'success');
        }, 500);
    }
    
    function mostrarErrorEnvio() {
        const $botonEnvio = $('.boton-envio');
        
        // Restaurar botón
        $botonEnvio.prop('disabled', false).removeClass('cargando').text('Enviar Reporte');
        
        // Mostrar error
        mostrarToast('Error al enviar el reporte. Inténtalo de nuevo.', 'error');
    }
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    function mostrarError(campo, mensaje) {
        // Remover errores previos
        ocultarError(campo);
        
        // Agregar nuevo error
        const errorHtml = '<div class="mensaje-error" data-campo="' + campo + '">' + mensaje + '</div>';
        const $error = $(errorHtml);
        $('#' + campo).closest('.campo-formulario').append($error);
        
        // Efecto de entrada
        setTimeout(function() {
            $error.addClass('mostrar');
        }, 10);
    }
    
    function ocultarError(campo) {
        $('.mensaje-error[data-campo="' + campo + '"]').remove();
    }
    
    function formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function generarNumeroReporte() {
        const fecha = new Date();
        const numero = Math.floor(Math.random() * 9000) + 1000;
        return fecha.getFullYear().toString() + numero.toString();
    }
    
    function hayCanibiosSinGuardar() {
        return $('#problem-type').val() || $('#location').val().trim() || $('#description').val().trim() || archivoSeleccionado !== null;
    }
    
    function mostrarDialogoSalida(destino) {
        const dialogoHtml = '<div class="overlay-dialogo"><div class="dialogo-confirmacion"><h3>¿Abandonar sin guardar?</h3><p>Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?</p><div class="acciones-dialogo"><button class="boton-cancelar">Cancelar</button><button class="boton-salir">Salir sin guardar</button></div></div></div>';
        const $dialogo = $(dialogoHtml);
        
        $('body').append($dialogo);
        
        // Manejar acciones
        $dialogo.find('.boton-cancelar').on('click', function() {
            $dialogo.remove();
        });
        
        $dialogo.find('.boton-salir').on('click', function() {
            window.location.href = destino;
        });
        
        // Cerrar con escape
        $(document).on('keydown.dialogo', function(e) {
            if (e.key === 'Escape') {
                $dialogo.remove();
                $(document).off('keydown.dialogo');
            }
        });
    }
    
    function mostrarToast(mensaje, tipo) {
        tipo = tipo || 'info';
        const iconos = {
            'success': 'check_circle',
            'error': 'error',
            'info': 'info'
        };
        
        const toastHtml = '<div class="toast toast-' + tipo + '"><span class="material-symbols-outlined">' + iconos[tipo] + '</span><span>' + mensaje + '</span></div>';
        const $toast = $(toastHtml);
        
        $('body').append($toast);
        
        setTimeout(function() {
            $toast.addClass('mostrar');
        }, 100);
        
        setTimeout(function() {
            $toast.removeClass('mostrar');
            setTimeout(function() {
                $toast.remove();
            }, 300);
        }, 3000);
    }
    
    // ===========================
    // HEADER Y CONTROLES
    // ===========================
    
    // Reutilizar funciones del dashboard para header
    $('.boton-notificaciones').on('click', function(e) {
        e.preventDefault();
        mostrarToast('Panel de notificaciones próximamente', 'info');
    });
    
    $('.perfil-usuario').on('click', function(e) {
        e.preventDefault();
        mostrarToast('Menú de perfil próximamente', 'info');
    });
    
    // ===========================
    // ATAJOS DE TECLADO
    // ===========================
    
    $(document).on('keydown', function(e) {
        // Solo si no hay diálogos abiertos
        if ($('.overlay-dialogo, .modal-previsualizacion').length === 0) {
            switch(e.key) {
                case 's':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        $('.formulario-reporte').submit();
                    }
                    break;
                case 'Escape':
                    // Limpiar formulario
                    if (hayCanibiosSinGuardar()) {
                        mostrarDialogoSalida('dashboard.html');
                    }
                    break;
            }
        }
    });
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    function inicializar() {
        // Animación de entrada
        $('.encabezado-pagina').css('opacity', '0').animate({opacity: 1}, 600);
        
        setTimeout(function() {
            $('.tarjeta-formulario').css({
                opacity: '0',
                transform: 'translateY(20px)'
            }).animate({opacity: 1}, 600).css('transform', 'translateY(0)');
        }, 200);
        
        console.log('Crear Reporte JavaScript inicializado');
        console.log('Atajos disponibles: Ctrl+S (Enviar), Escape (Salir)');
        console.log('Soporta imágenes (PNG, JPG, GIF hasta 10MB) y videos (MP4, MOV, AVI hasta 50MB)');
    }
    
    // Ejecutar inicialización
    inicializar();
});

// ===========================
// FUNCIONES GLOBALES
// ===========================

// Función para limpiar formulario
window.limpiarFormulario = function() {
    $('.formulario-reporte')[0].reset();
    $('.campo-formulario input, .campo-formulario select, .campo-formulario textarea').removeClass('valido error');
    $('.mensaje-error').remove();
    if (typeof eliminarArchivo === 'function') {
        eliminarArchivo();
    }
};