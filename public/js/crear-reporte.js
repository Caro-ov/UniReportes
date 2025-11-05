// Función principal de inicialización para compatibilidad con SPA
function inicializarCrearReporte() {
    console.log('🎬 Inicializando crear-reporte...');
    
    // Verificar que elementos existen
    const formExists = $('#formulario-reporte').length > 0;
    const submitBtnExists = $('.boton-envio').length > 0;
    const categoriaExists = $('#categoria').length > 0;
    const ubicacionExists = $('#ubicacion').length > 0;
    const salonExists = $('#salon').length > 0;
    
    console.log('📋 Estado de elementos del formulario:', {
        formulario: formExists,
        botonEnvio: submitBtnExists,
        categoria: categoriaExists,
        ubicacion: ubicacionExists,
        salon: salonExists
    });
    
    // ===========================
    // DROPDOWN DEL PERFIL
    // ===========================
    $('.avatar-usuario').off('click.crearReporte').on('click.crearReporte', function(e) { 
        e.stopPropagation(); 
        $('.menu-desplegable').toggleClass('mostrar'); 
    });
    
    $(document).off('click.crearReporte').on('click.crearReporte', function() { 
        $('.menu-desplegable').removeClass('mostrar'); 
    });
    
    $('.menu-desplegable').off('click.crearReporte').on('click.crearReporte', function(e) { 
        e.stopPropagation(); 
    });
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================

    // Variables globales
    let archivoSeleccionado = null;
    let validacionEnTiempoReal = true;

        // Inicializar elementos
        cargarCategorias();
        cargarUbicaciones();
        establecerFechaHoraActual();

    // ===========================
    // CONFIGURACIÓN DE FECHA Y HORA
    // ===========================
    
    function establecerFechaHoraActual() {
        console.log('📅 Estableciendo fecha y hora actual...');
        const ahora = new Date();
        
        // Formatear fecha para input type="date" (YYYY-MM-DD)
        const fechaFormateada = ahora.toISOString().split('T')[0];
        
        // Formatear hora para input type="time" (HH:MM)
        const horaFormateada = ahora.toTimeString().slice(0, 5);
        
        // Establecer valores por defecto
        $('#fecha-reporte').val(fechaFormateada);
        $('#hora-reporte').val(horaFormateada);
        
        // Establecer fecha máxima como hoy
        $('#fecha-reporte').attr('max', fechaFormateada);
        
        console.log('📅 Fecha y hora establecidas:', {
            fecha: fechaFormateada,
            hora: horaFormateada
        });
    }

    // ===========================
    // CARGA DE CATEGORÍAS / OBJETOS / EDIFICIOS
    // ===========================
    async function cargarCategorias() {
        console.log('Iniciando carga de categorías...');
        try {
            const res = await fetch('/api/categories');
            console.log('Respuesta del servidor:', res);
            const json = await res.json();
            console.log('Datos recibidos:', json);
            if (res.ok && json.success) {
                const categorias = json.data || [];
                console.log('Categorías encontradas:', categorias.length);
                const $sel = $('#categoria');
                $sel.html('<option disabled selected value="">Selecciona una categoría...</option>');
                categorias.forEach(cat => {
                    console.log('Agregando categoría:', cat.nombre);
                    $sel.append(`<option value="${cat.id_categoria}">${escapeHtml(cat.nombre)}</option>`);
                });
                console.log('Categorías cargadas exitosamente');
            } else {
                console.error('No se pudieron cargar categorías', json);
            }
        } catch (err) {
            console.error('Error cargando categorías', err);
        }
    }        async function cargarObjetos(categoriaId) {
            const $sel = $('#objeto');
            $sel.prop('disabled', true).html('<option>Cargando...</option>');
            try {
                const res = await fetch(`/api/objects/categoria/${categoriaId}`);
                const json = await res.json();
                if (res.ok && json.success) {
                    const objetos = json.data || [];
                    if (objetos.length === 0) {
                        $sel.html('<option disabled selected value="">No hay objetos para esta categoría</option>');
                        $sel.prop('disabled', true);
                    } else {
                        $sel.html('<option disabled selected value="">Selecciona un objeto (opcional)</option>');
                        objetos.forEach(o => $sel.append(`<option value="${o.id_objeto}">${escapeHtml(o.nombre)}</option>`));
                        $sel.prop('disabled', false);
                    }
                } else {
                    console.error('Error al cargar objetos', json);
                    $sel.html('<option disabled selected value="">Error al cargar objetos</option>');
                    $sel.prop('disabled', true);
                }
            } catch (err) {
                console.error('Error cargando objetos', err);
                $sel.html('<option disabled selected value="">Error al conectar</option>');
                $sel.prop('disabled', true);
            }
        }

    async function cargarUbicaciones() {
        console.log('Cargando ubicaciones...');
        try {
            const res = await fetch('/api/ubicaciones');
            const json = await res.json();
            if (res.ok && json.success) {
                const ubicaciones = json.data || [];
                const $sel = $('#ubicacion');
                $sel.html('<option disabled selected value="">Selecciona una ubicación...</option>');
                ubicaciones.forEach(ubicacion => {
                    console.log('Agregando ubicación:', ubicacion.nombre);
                    $sel.append(`<option value="${escapeHtml(ubicacion.id_ubicacion)}">${escapeHtml(ubicacion.nombre)}</option>`);
                });
                console.log('Ubicaciones cargadas exitosamente');
            } else {
                console.error('Error al cargar ubicaciones', json);
            }
        } catch (err) {
            console.error('Error cargando ubicaciones', err);
        }
    }

    async function cargarSalones(idUbicacion) {
        console.log('Cargando salones para ubicación ID:', idUbicacion);
        const $salon = $('#salon');
        $salon.prop('disabled', true).html('<option>Cargando salones...</option>');
        
        try {
            const res = await fetch(`/api/ubicaciones/${idUbicacion}/salones`);
            const json = await res.json();
            if (res.ok && json.success) {
                const salones = json.data || [];
                if (salones.length === 0) {
                    $salon.html('<option disabled selected value="">No hay salones registrados para esta ubicación</option>');
                    $salon.prop('disabled', true);
                } else {
                    $salon.html('<option disabled selected value="">Selecciona un salón...</option>');
                    salones.forEach(salon => {
                        $salon.append(`<option value="${salon.id_salon}">${escapeHtml(salon.nombre)}</option>`);
                    });
                    $salon.prop('disabled', false);
                }
            } else {
                console.error('Error al cargar salones', json);
                $salon.html('<option disabled selected value="">Error al cargar salones</option>');
                $salon.prop('disabled', true);
            }
        } catch (err) {
            console.error('Error cargando salones', err);
            $salon.html('<option disabled selected value="">Error al conectar</option>');
            $salon.prop('disabled', true);
        }
    }

    // ===========================
    // ADVERTENCIA DE URGENCIA
    // ===========================
    
    function mostrarAdvertenciaUrgencia() {
        console.log('⚠️ Mostrando advertencia de urgencia...');
        
        // Crear el modal de advertencia
        const modalHtml = `
            <div id="modal-urgencia" class="modal-overlay" style="display: none;">
                <div class="modal-contenido modal-advertencia">
                    <div class="modal-header">
                        <span class="material-symbols-outlined icono-advertencia">warning</span>
                        <h3>⚠️ Advertencia - Categoría Urgencia</h3>
                    </div>
                    <div class="modal-body">
                        <p><strong>¿Está seguro de que este reporte es realmente urgente?</strong></p>
                        <p>La categoría de urgencia está reservada para situaciones que requieren atención inmediata, como:</p>
                        <ul>
                            <li>Riesgos de seguridad inmediatos</li>
                            <li>Fallas de equipos críticos</li>
                            <li>Emergencias que afectan la operación normal</li>
                            <li>Situaciones que pueden causar daños o lesiones</li>
                        </ul>
                        <p>Si su reporte no requiere atención inmediata, por favor seleccione otra categoría más apropiada.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secundario" onclick="window.cancelarUrgencia()">
                            Cambiar categoría
                        </button>
                        <button type="button" class="btn-principal" onclick="window.confirmarUrgencia()">
                            Sí, es urgente
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente si existe
        $('#modal-urgencia').remove();
        
        // Agregar el modal al DOM
        $('body').append(modalHtml);
        
        // Mostrar el modal
        $('#modal-urgencia').fadeIn(300);
        
        console.log('🔍 Modal agregado al DOM:', $('#modal-urgencia').length);
    }
    
    function cerrarModalUrgencia() {
        console.log('🔄 Cerrando modal de urgencia...');
        $('#modal-urgencia').fadeOut(300, function() {
            $(this).remove();
        });
    }
    
    function resetearCategoria() {
        console.log('🔄 Reseteando categoría y objetos...');
        $('#categoria').val('');
        $('#objeto').prop('disabled', true).html('<option disabled selected value="">Primero selecciona una categoría...</option>');
    }
    
    // Funciones globales para los botones del modal
    window.cancelarUrgencia = function() {
        console.log('✅ Función global cancelarUrgencia ejecutada');
        resetearCategoria();
        cerrarModalUrgencia();
    };
    
    window.confirmarUrgencia = function() {
        console.log('✅ Función global confirmarUrgencia ejecutada');
        // Agregar efecto visual de confirmación
        $('#categoria').addClass('categoria-urgencia-confirmada');
        setTimeout(() => {
            $('#categoria').removeClass('categoria-urgencia-confirmada');
        }, 2000);
        cerrarModalUrgencia();
    };

        // ===========================
        // VALIDACIONES
        // ===========================
            // ===========================
    // VALIDACIONES
    // ===========================
    $('#categoria').on('change', function() { 
        const cat = $(this).val(); 
        console.log('Categoría seleccionada:', cat);
        
        // Verificar si es categoría de urgencia (ID 6)
        if (cat == '6') {
            mostrarAdvertenciaUrgencia();
        }
        
        if (cat) cargarObjetos(cat); 
    });
    
    $('#ubicacion').on('change', function() {
        const idUbicacion = $(this).val();
        console.log('Ubicación seleccionada ID:', idUbicacion);
        if (idUbicacion) cargarSalones(idUbicacion);
    });
        $('#titulo').on('input blur', function() { const val = $(this).val().trim(); if (val.length >= 5) { $(this).removeClass('error').addClass('valido'); ocultarError('titulo'); } else { $(this).removeClass('valido').addClass('error'); mostrarError('titulo', 'El título debe tener al menos 5 caracteres'); } });
        $('#salon').on('input blur', function() { const val = $(this).val().trim(); if (val.length >= 1) { $(this).removeClass('error').addClass('valido'); ocultarError('salon'); } else { $(this).removeClass('valido').addClass('error'); mostrarError('salon', 'El salón es requerido'); } });
        $('#descripcion').on('input blur', function() { const val = $(this).val().trim(); if (val.length >= 10) { $(this).removeClass('error').addClass('valido'); ocultarError('descripcion'); } else { $(this).removeClass('valido').addClass('error'); mostrarError('descripcion', 'La descripción debe tener al menos 10 caracteres'); } });

        // ===========================
        // MANEJO DE ARCHIVOS (drag & drop + preview)
        // ===========================
        const $zonaSubida = $('.zona-subida-archivo');
        const $inputArchivo = $('#file-upload');
        $zonaSubida.on('dragover dragenter', function(e) { e.preventDefault(); e.stopPropagation(); $(this).addClass('arrastrando'); });
        $zonaSubida.on('dragleave', function(e) { e.preventDefault(); e.stopPropagation(); $(this).removeClass('arrastrando'); });
        $zonaSubida.on('drop', function(e) { e.preventDefault(); e.stopPropagation(); $(this).removeClass('arrastrando'); const archivos = e.originalEvent.dataTransfer.files; if (archivos.length > 0) procesarArchivo(archivos[0]); });
        $inputArchivo.on('change', function() { if (this.files && this.files[0]) procesarArchivo(this.files[0]); });
        $zonaSubida.on('click', function() { $inputArchivo.click(); });

        function procesarArchivo(archivo) {
            const tiposImagenes = ['image/png','image/jpeg','image/jpg','image/gif'];
            const tiposVideos = ['video/mp4','video/quicktime','video/avi','video/x-msvideo','video/mov'];
            const tiposPermitidos = [...tiposImagenes, ...tiposVideos];
            if (!tiposPermitidos.includes(archivo.type)) { mostrarError('file-upload', 'Tipo de archivo no permitido'); return; }
            const esVideo = tiposVideos.includes(archivo.type);
            const tamanoMaximo = esVideo ? 50*1024*1024 : 10*1024*1024;
            if (archivo.size > tamanoMaximo) { mostrarError('file-upload', 'Archivo demasiado grande'); return; }
            archivoSeleccionado = archivo; mostrarVistaPrevia(archivo); ocultarError('file-upload');
        }

        function mostrarVistaPrevia(archivo) {
            const esVideo = archivo.type.startsWith('video/');
            const reader = new FileReader();
            reader.onload = function(e) {
                let elementoPrevia = esVideo ? `<video class="video-previa" controls><source src="${e.target.result}" type="${archivo.type}">Tu navegador no soporta video.</video>` : `<img src="${e.target.result}" alt="Vista previa" class="imagen-previa">`;
                const contenido = `<div class="vista-previa">${elementoPrevia}<div class="info-archivo"><div class="tipo-archivo"><span class="material-symbols-outlined">${esVideo? 'videocam':'image'}</span><span class="etiqueta-tipo">${esVideo? 'Video':'Imagen'}</span></div><p class="nombre-archivo">${escapeHtml(archivo.name)}</p><p class="tamano-archivo">${formatearTamano(archivo.size)}</p><div class="controles-archivo"><button type="button" class="boton-previsualizar"><span class="material-symbols-outlined">${esVideo? 'play_circle':'zoom_in'}</span>${esVideo? 'Reproducir':'Ver completa'}</button><button type="button" class="boton-eliminar-archivo"><span class="material-symbols-outlined">close</span>Eliminar</button></div></div></div>`;
                $('.contenido-subida').html(contenido);
                $('.boton-eliminar-archivo').on('click', function(e){ e.stopPropagation(); eliminarArchivo(); });
                $('.boton-previsualizar').on('click', function(e){ e.stopPropagation(); mostrarPrevisualizacionCompleta(archivo, e.target.result); });
            };
            reader.readAsDataURL(archivo);
        }

        function eliminarArchivo() { archivoSeleccionado = null; $inputArchivo.val(''); $('.contenido-subida').html('<svg class="icono-subida" fill="none" stroke="currentColor" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg><div class="texto-subida"><label for="file-upload" class="enlace-subida"><span>Sube un archivo</span><input id="file-upload" name="file-upload" type="file" class="input-oculto"/></label><span class="texto-adicional">o arrastra y suelta</span></div><p class="texto-ayuda">PNG, JPG, GIF, MP4, MOV, AVI hasta 50MB</p>'); $('#file-upload').on('change', function(){ if (this.files && this.files[0]) procesarArchivo(this.files[0]); }); }

        function mostrarPrevisualizacionCompleta(archivo, dataUrl) { const esVideo = archivo.type.startsWith('video/'); let contenidoModal = esVideo ? `<video class="video-modal" controls autoplay><source src="${dataUrl}" type="${archivo.type}">Tu navegador no soporta la reproducción de video.</video>` : `<img src="${dataUrl}" alt="${escapeHtml(archivo.name)}" class="imagen-modal">`; const modal = $(`<div class="modal-previsualizacion"><div class="overlay-modal"></div><div class="contenido-modal"><div class="header-modal"><h3>${escapeHtml(archivo.name)}</h3><button class="cerrar-modal"><span class="material-symbols-outlined">close</span></button></div><div class="cuerpo-modal">${contenidoModal}</div><div class="footer-modal"><div class="info-modal"><span class="material-symbols-outlined">${esVideo? 'videocam':'image'}</span><span>${esVideo? 'Video':'Imagen'} • ${formatearTamano(archivo.size)}</span></div></div></div></div>`); $('body').append(modal); setTimeout(()=> modal.addClass('mostrar'), 10); modal.find('.cerrar-modal, .overlay-modal').on('click', ()=> { modal.removeClass('mostrar'); setTimeout(()=> modal.remove(), 300); }); $(document).on('keydown.modal', function(e){ if (e.key === 'Escape') { modal.removeClass('mostrar'); setTimeout(()=> { modal.remove(); $(document).off('keydown.modal'); }, 300); } }); }

        // ===========================
        // ENVÍO DEL FORMULARIO
        // ===========================
        console.log('🔗 Registrando evento submit del formulario...');
        $('#formulario-reporte').off('submit.crearReporte').on('submit.crearReporte', function(e) { 
            console.log('📤 Submit detectado, preventDefault y validación...');
            e.preventDefault(); 
            if (validarFormulario()) {
                console.log('✅ Validación exitosa, llamando enviarReporte...');
                enviarReporte(); 
            } else {
                console.log('❌ Validación fallida');
            }
        });
        
        // También agregar handler al botón directamente por si acaso
        $('.boton-envio').off('click.crearReporte').on('click.crearReporte', function(e) {
            console.log('🔘 Click en botón envío detectado');
            e.preventDefault();
            if (validarFormulario()) {
                console.log('✅ Validación exitosa desde botón, llamando enviarReporte...');
                enviarReporte(); 
            } else {
                console.log('❌ Validación fallida desde botón');
            }
        });

        function validarFormulario() { 
            console.log('🔍 Validando formulario...');
            let esValido = true; 
            
            const categoria = $('#categoria').val();
            const titulo = $('#titulo').val().trim();
            const ubicacion = $('#ubicacion').val();
            const salon = $('#salon').val();
            const descripcion = $('#descripcion').val().trim();
            const fechaReporte = $('#fecha-reporte').val();
            const horaReporte = $('#hora-reporte').val();
            
            console.log('📊 Valores del formulario:', {
                categoria, titulo, ubicacion, salon, descripcion, fechaReporte, horaReporte
            });
            
            if (!categoria) { 
                console.log('❌ Categoría vacía');
                mostrarError('categoria','La categoría es obligatoria'); 
                esValido = false; 
            } 
            if (!titulo || titulo.length < 5) { 
                console.log('❌ Título inválido:', titulo);
                mostrarError('titulo','El título es obligatorio (mínimo 5 caracteres)'); 
                esValido = false; 
            } 
            if (!ubicacion) { 
                console.log('❌ Ubicación vacía');
                mostrarError('ubicacion','Selecciona una ubicación'); 
                esValido = false; 
            } 
            if (!salon) { 
                console.log('❌ Salón vacío');
                mostrarError('salon','El salón es obligatorio'); 
                esValido = false; 
            } 
            if (!fechaReporte) { 
                console.log('❌ Fecha del reporte vacía');
                mostrarError('fecha-reporte','La fecha del reporte es obligatoria'); 
                esValido = false; 
            } else {
                // Validar que la fecha no sea en el futuro
                const fechaSeleccionada = new Date(fechaReporte);
                const hoy = new Date();
                hoy.setHours(23, 59, 59, 999); // Hasta el final del día actual
                
                if (fechaSeleccionada > hoy) {
                    console.log('❌ Fecha del reporte en el futuro');
                    mostrarError('fecha-reporte','La fecha del reporte no puede ser en el futuro'); 
                    esValido = false; 
                }
            }
            if (!horaReporte) { 
                console.log('❌ Hora del reporte vacía');
                mostrarError('hora-reporte','La hora del reporte es obligatoria'); 
                esValido = false; 
            }
            if (!descripcion || descripcion.length < 10) { 
                console.log('❌ Descripción inválida:', descripcion);
                mostrarError('descripcion','La descripción es obligatoria (mínimo 10 caracteres)'); 
                esValido = false; 
            } 
            
            console.log('🎯 Resultado validación:', esValido);
            return esValido; 
        }

        async function enviarReporte() {
            console.log('🚀 Iniciando envío de reporte...');
            const $botonEnvio = $('.boton-envio');
            $botonEnvio.prop('disabled', true).addClass('cargando').html('<span class="material-symbols-outlined">sync</span> Enviando...');

            // Combinar fecha y hora en una sola fecha
            const fechaReporte = $('#fecha-reporte').val();
            const horaReporte = $('#hora-reporte').val();
            const fechaCompleta = `${fechaReporte} ${horaReporte}`;
            
            const payload = { 
                titulo: $('#titulo').val().trim(), 
                descripcion: $('#descripcion').val().trim(), 
                id_salon: parseInt($('#salon').val()), 
                id_categoria: parseInt($('#categoria').val()) || null, 
                id_objeto: $('#objeto').val() ? parseInt($('#objeto').val()) : null,
                fecha_reporte: fechaCompleta
            };

            console.log('📦 Payload a enviar:', payload);

            try {
                const resp = await fetch('/api/reports', { 
                    method: 'POST', 
                    credentials: 'include', // Incluir cookies de sesión
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                
                console.log('📡 Respuesta del servidor:', resp.status, resp.statusText);
                const json = await resp.json();
                console.log('📊 Datos de respuesta:', json);
                
                if (resp.ok && json.success) { 
                    console.log('✅ Reporte creado exitosamente con ID:', json.data?.id);
                    mostrarExito(json.data?.id); 
                }
                else { 
                    console.error('❌ Error de API:', json); 
                    mostrarToast(json.message || 'Error al crear el reporte', 'error'); 
                    $botonEnvio.prop('disabled', false).removeClass('cargando').text('Enviar Reporte'); 
                }
            } catch (err) { 
                console.error('❌ Error de conexión:', err); 
                mostrarToast('Error al enviar el reporte. Revisa tu conexión.', 'error'); 
                $botonEnvio.prop('disabled', false).removeClass('cargando').text('Enviar Reporte'); 
            }
        }

        function mostrarExito(idReporte) { $('.tarjeta-formulario').addClass('ocultar'); setTimeout(function() { const numero = idReporte ? ('#' + idReporte) : generarNumeroReporte(); $('.contenedor-formulario').html(`<div class="mensaje-exito"><div class="icono-exito"><span class="material-symbols-outlined">check_circle</span></div><h2>¡Reporte enviado exitosamente!</h2><p>Tu reporte ha sido recibido y será revisado por nuestro equipo. Te notificaremos sobre cualquier actualización.</p><div class="numero-reporte"><strong>Número de reporte: ${numero}</strong></div><div class="acciones-exito"><button class="boton-secundario" onclick="window.location.href='mis-reportes.html'">Ver mis reportes</button><button class="boton-principal" onclick="window.location.href='crear-reporte.html'">Crear otro reporte</button></div></div>`); }, 300); setTimeout(function(){ mostrarToast('¡Reporte creado exitosamente!', 'success'); }, 500); }

        // ===========================
        // UTILIDADES
        // ===========================
        function mostrarError(campo, mensaje) { ocultarError(campo); const errorHtml = `<div class="mensaje-error" data-campo="${campo}">${escapeHtml(mensaje)}</div>`; $('#' + campo).closest('.campo-formulario').append(errorHtml); setTimeout(function(){ $('.mensaje-error[data-campo="'+campo+'"]').addClass('mostrar'); }, 10); }
        function ocultarError(campo) { $('.mensaje-error[data-campo="'+campo+'"]').remove(); }
        function formatearTamano(bytes) { if (bytes===0) return '0 Bytes'; const k=1024; const sizes=['Bytes','KB','MB','GB']; const i=Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i]; }
        function generarNumeroReporte() { const fecha = new Date(); const numero = Math.floor(Math.random()*9000)+1000; return fecha.getFullYear().toString() + numero.toString(); }
        function hayCanibiosSinGuardar() { return $('#categoria').val() || $('#titulo').val().trim() || $('#descripcion').val().trim() || archivoSeleccionado !== null || $('#ubicacion').val(); }
        function mostrarDialogoSalida(destino) { const dialogoHtml = '<div class="overlay-dialogo"><div class="dialogo-confirmacion"><h3>¿Abandonar sin guardar?</h3><p>Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?</p><div class="acciones-dialogo"><button class="boton-cancelar">Cancelar</button><button class="boton-salir">Salir sin guardar</button></div></div></div>'; const $dialogo = $(dialogoHtml); $('body').append($dialogo); $dialogo.find('.boton-cancelar').on('click', function(){ $dialogo.remove(); }); $dialogo.find('.boton-salir').on('click', function(){ window.location.href = destino; }); $(document).on('keydown.dialogo', function(e){ if (e.key === 'Escape') { $dialogo.remove(); $(document).off('keydown.dialogo'); } }); }
        function mostrarToast(mensaje, tipo) { tipo = tipo || 'info'; const iconos = { 'success':'check_circle','error':'error','info':'info' }; const toastHtml = `<div class="toast toast-${tipo}"><span class="material-symbols-outlined">${iconos[tipo]}</span><span>${escapeHtml(mensaje)}</span></div>`; const $toast = $(toastHtml); $('body').append($toast); setTimeout(()=> $toast.addClass('mostrar'),100); setTimeout(()=> { $toast.removeClass('mostrar'); setTimeout(()=> $toast.remove(),300); },3000); }
        function escapeHtml(text) { if (text==null) return ''; return String(text).replace(/[&"'<>]/g, function (s) { return ({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'})[s]; }); }

        // desbloquear menu del perfil si existe
        $('#dropdownPerfil').off('click.crearReporte').on('click.crearReporte', function(e) { e.preventDefault(); e.stopPropagation(); $('#menuPerfil').toggleClass('mostrar'); });
        $(document).off('click.crearReporteProfile').on('click.crearReporteProfile', function(e){ if (!$(e.target).closest('.dropdown-perfil').length) { $('#menuPerfil').removeClass('mostrar'); } });

    console.log('✅ Crear-reporte inicializado correctamente');
}

// Inicializar automáticamente si DOM está listo (para carga directa)
$(document).ready(function() {
    inicializarCrearReporte();
});

// Función para limpiar formulario disponible globalmente
window.limpiarFormulario = function() { 
    const f = document.querySelector('#formulario-reporte'); 
    if (f) f.reset(); 
    $('.campo-formulario input, .campo-formulario select, .campo-formulario textarea').removeClass('valido error'); 
    $('.mensaje-error').remove(); 
    if (typeof eliminarArchivo === 'function') eliminarArchivo(); 
};

// Exponer la función de inicialización globalmente para SPA
window.inicializarCrearReporte = inicializarCrearReporte;