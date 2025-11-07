/* Utilidades compartidas para las páginas de detalle de reporte */
(function(window, $){
    'use strict';

    // Formateo de tamaños
    window.formatearTamaño = function(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Clase CSS según estado
    window.obtenerClaseEstado = function(estado) {
        const estadosClases = {
            'pendiente': 'enviado',
            'en revision': 'revisado',
            'revisado': 'revisado',
            'en proceso': 'proceso',
            'resuelto': 'resuelto',
            'cerrado': 'resuelto'
        };
        return estadosClases[(estado || '').toLowerCase()] || 'enviado';
    };

    // Formato de fecha legible
    window.formatearFecha = function(fecha) {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Icono para eventos del historial
    window.obtenerIconoHistorial = function(tipo) {
        const iconos = {
            'creacion': 'send',
            'cambio_estado': 'hourglass_top',
            'asignacion': 'person',
            'comentario': 'chat',
            'resolucion': 'check_circle',
            'cierre': 'lock'
        };
        return iconos[tipo] || 'info';
    };

    // Título para eventos del historial
    window.obtenerTituloHistorial = function(tipo, evento) {
        const titulos = {
            'creacion': 'Reporte enviado',
            'cambio_estado': `Estado cambiado a: ${evento && (evento.valor_nuevo || evento.estado_nuevo) || ''}`,
            'asignacion': 'Técnico asignado',
            'comentario': 'Comentario agregado',
            'resolucion': 'Reporte resuelto',
            'cierre': 'Reporte cerrado'
        };
        return titulos[tipo] || 'Actividad registrada';
    };

    // Mostrar/ocultar indicador de carga (usa selectores presentes en la plantilla)
    window.mostrarCarga = function(mostrar) {
        if (mostrar) {
            $('.contenedor-contenido').addClass('cargando');
            $('.tarjeta-reporte').css('opacity', '0.5');
        } else {
            $('.contenedor-contenido').removeClass('cargando');
            $('.tarjeta-reporte').css('opacity', '1');
        }
    };

    // Escapar HTML
    window.escapeHtml = function(text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    // Mostrar error genérico en el contenedor de contenido. Usa window.DETALLE_BACK_PAGE si está definida
    window.mostrarErrorDetalle = function(mensaje) {
        console.error('ERROR DETALLE:', mensaje);
        const contenedorContenido = $('.contenedor-contenido');
        const backPage = window.DETALLE_BACK_PAGE || 'mis-reportes';
        const backNav = (backPage === 'explorar-reportes') ? `if (window.spaNav) { window.spaNav.navigateTo('explorar-reportes'); } else { window.location.href = '/explorar-reportes.html'; }` : `if (window.spaNav) { window.spaNav.navigateTo('mis-reportes'); } else { window.location.href = '/mis-reportes.html'; }`;
        contenedorContenido.html(`
            <div class="error-container" style="text-align: center; padding: 3rem; color: #666;">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #e74c3c; margin-bottom: 1rem;">error</span>
                <h3 style="margin: 1rem 0; color: #333;">Error al cargar el reporte</h3>
                <p style="margin-bottom: 2rem; font-size: 1.1rem;">${escapeHtml(mensaje)}</p>
                <button onclick="${backNav}" class="boton-secundario">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Volver
                </button>
            </div>
        `);
    };

    // Abrir archivo en modal (imagen) o en nueva pestaña (video/u otros)
    window.verArchivo = function(url, filename, tipo) {
        console.log(`Abriendo archivo: ${filename}`);
        if (tipo === 'imagen') {
            const modal = $(`
                <div class="modal-archivo" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                    <div class="modal-content" style="position: relative; max-width: 90%; max-height: 90%; background: white; border-radius: 8px; overflow: hidden;">
                        <div class="modal-header" style="padding: 1rem; background: #f8f9fa; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="margin: 0; color: #333;">${escapeHtml(filename)}</h4>
                            <button class="cerrar-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 4px; color: #666;"><span class="material-symbols-outlined">close</span></button>
                        </div>
                        <img src="${url}" alt="${escapeHtml(filename)}" style="max-width: 100%; max-height: 70vh; display: block; margin: 0 auto;">
                    </div>
                </div>
            `);
            $('body').append(modal);
            modal.find('.cerrar-modal').on('click', () => modal.remove());
            modal.on('click', function(e) { if (e.target === this) modal.remove(); });
            $(document).on('keydown.modal', function(e) { if (e.key === 'Escape') { modal.remove(); $(document).off('keydown.modal'); } });
        } else {
            window.open(url, '_blank');
        }
    };

    // Descargar archivo
    window.descargarArchivo = function(url, filename) {
        const link = document.createElement('a'); link.href = url; link.download = filename; link.style.display = 'none'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    // Obtener id de reporte desde la URL
    window.obtenerIdReporte = function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    };

    // Obtener datos del usuario actual (útil para el formulario de comentarios)
    window.obtenerUsuarioActual = async function() {
        try {
            const response = await fetch('/api/users/profile');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    return { nombre: data.data.nombre || 'Usuario', rol: data.data.rol || 'monitor', rolDisplay: data.data.rol === 'admin' ? 'Administrador' : 'Monitor' };
                }
            }
        } catch (error) { console.error('Error obtenerUsuarioActual:', error); }
        return { nombre: 'Usuario', rol: 'monitor', rolDisplay: 'Monitor' };
    };

    // Cargar datos del usuario en el formulario de comentarios
    window.cargarDatosUsuarioEnFormulario = async function() {
        const usuario = await window.obtenerUsuarioActual();
        $('.usuario-nombre').text(usuario.nombre);
        $('.usuario-rol').text(usuario.rolDisplay);
        const avatarContainer = $('.comentario-form .avatar');
        if (avatarContainer.length > 0) {
            const icono = usuario.rol === 'admin' ? 'admin_panel_settings' : 'person';
            const colorScheme = usuario.rol === 'admin' ? 'admin' : '';
            avatarContainer.removeClass('admin').addClass(colorScheme);
            avatarContainer.find('.material-symbols-outlined').text(icono);
        }
    };

    // Enviar comentario (global)
    window.enviarComentario = async function() {
        const textarea = document.getElementById('nuevo-comentario');
        const texto = textarea ? textarea.value.trim() : '';
        if (!texto) { alert('Por favor, escribe un comentario antes de enviar.'); return; }
        if (texto.length < 10) { alert('El comentario debe tener al menos 10 caracteres.'); return; }
        const reportId = window.obtainIdReporte ? window.obtainIdReporte() : window.obtenerIdReporte(); if (!reportId) { alert('Error: No se pudo identificar el reporte actual.'); return; }
        const btnEnviar = document.querySelector('.btn-enviar'); if (btnEnviar) { btnEnviar.disabled = true; btnEnviar.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Enviando...'; }
        try {
            const response = await fetch(`/api/comments/report/${reportId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ comentario: texto }) });
            const data = await response.json();
            if (response.ok && data.success) {
                if (textarea) textarea.value = '';
                await window.cargarComentariosReporte(reportId);
                setTimeout(() => { const contenedorComentarios = $('.comentarios-lista'); const ultimoComentario = contenedorComentarios.children().last()[0]; if (ultimoComentario) ultimoComentario.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
            } else { throw new Error(data.message || 'Error enviando comentario'); }
        } catch (error) { console.error('Error enviando comentario:', error); alert('Error enviando comentario: ' + error.message); }
        finally { if (btnEnviar) { btnEnviar.disabled = false; btnEnviar.innerHTML = '<span class="material-symbols-outlined">send</span> Enviar'; } }
    };

    // Cargar comentarios
    window.cargarComentariosReporte = async function(reportId) {
        try {
            const response = await fetch(`/api/comments/report/${reportId}`, { credentials: 'include' });
            if (!response.ok) { if (response.status === 404) { window.mostrarComentarios([]); return; } throw new Error(`Error ${response.status}`); }
            const data = await response.json(); if (data.success) window.mostrarComentarios(data.data || []); else throw new Error(data.message || 'Error obteniendo comentarios');
        } catch (error) { console.error('Error cargando comentarios:', error); window.mostrarComentarios([]); }
    };

    // Mostrar comentarios
    window.mostrarComentarios = function(comentarios) {
        const contenedorComentarios = $('.comentarios-lista'); if (contenedorComentarios.length === 0) return;
        if (!comentarios || comentarios.length === 0) { contenedorComentarios.html(`<div class="sin-comentarios"><span class="material-symbols-outlined">chat_bubble_outline</span><p>No hay comentarios aún. ¡Sé el primero en comentar!</p></div>`); return; }
        const comentariosHTML = comentarios.map(comentario => {
            const esAdmin = comentario.autor && comentario.autor.rol === 'admin';
            const rolDisplay = esAdmin ? 'Administrador' : 'Monitor';
            const claseRol = esAdmin ? 'admin' : '';
            const fechaFormateada = window.formatearFechaComentario ? window.formatearFechaComentario(comentario.fecha) : new Date(comentario.fecha).toLocaleString();
            return `
                <div class="comentario-item ${claseRol}">
                    <div class="comentario-avatar ${claseRol}"><span class="material-symbols-outlined">${esAdmin ? 'admin_panel_settings' : 'person'}</span></div>
                    <div class="comentario-contenido">
                        <div class="comentario-header">
                            <span class="comentario-autor">${escapeHtml(comentario.autor ? comentario.autor.nombre : 'Usuario')}</span>
                            <span class="comentario-rol ${claseRol}">${rolDisplay}</span>
                            <span class="comentario-fecha">${fechaFormateada}</span>
                        </div>
                        <p class="comentario-texto">${escapeHtml(comentario.texto)}</p>
                    </div>
                </div>
            `;
        }).join('');
        contenedorComentarios.html(comentariosHTML);
    };

    // Formateo de fecha para comentarios (opcional)
    window.formatearFechaComentario = function(fecha) {
        if (!fecha) return 'Sin fecha';
        const fechaComentario = new Date(fecha); const ahora = new Date(); const diferencia = ahora - fechaComentario;
        if (diferencia < 60000) return 'Ahora';
        if (diferencia < 3600000) { const minutos = Math.floor(diferencia / 60000); return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`; }
        if (diferencia < 86400000) { const horas = Math.floor(diferencia / 3600000); return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`; }
        return fechaComentario.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

})(window, jQuery);
