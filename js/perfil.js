$(document).ready(function() {
    
    // ===========================
    // CONFIGURACIÓN INICIAL
    // ===========================
    
    console.log('Perfil de Usuario JavaScript inicializado');
    
    // ===========================
    // NAVEGACIÓN SIDEBAR
    // ===========================
    
    // Manejar navegación en sidebar
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
            case 'Perfil':
                destino = 'perfil.html';
                break;
            case 'Ayuda':
                destino = 'ayuda.html';
                break;
            default:
                destino = 'dashboard.html';
        }
        
        // Si es la misma página, no redirigir
        if (destino === 'perfil.html') {
            return;
        }
        
        // Redirigir directamente (sin pantalla de carga para navegación interna)
        window.location.href = destino;
    });
    
    // ===========================
    // FUNCIONALIDADES DEL PERFIL
    // ===========================
    
    // Cambiar foto de perfil
    $('.boton-cambiar-foto').on('click', function(e) {
        e.preventDefault();
        
        // Crear input file temporal
        const inputFile = $('<input type="file" accept="image/*" style="display: none;">');
        
        inputFile.on('change', function() {
            const archivo = this.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Actualizar todas las imágenes de perfil
                    $('.avatar-principal img, .avatar-usuario img, .perfil-usuario img').attr('src', e.target.result);
                    mostrarToast('Foto de perfil actualizada exitosamente', 'success');
                };
                reader.readAsDataURL(archivo);
            }
        });
        
        // Hacer clic en el input file
        inputFile.click();
    });
    
    // Opciones de configuración
    $('.opcion-configuracion').on('click', function(e) {
        e.preventDefault();
        
        const texto = $(this).find('span:not(.material-symbols-outlined)').first().text().trim();
        
        switch(texto) {
            case 'Editar Perfil':
                mostrarModalEditarPerfil();
                break;
            case 'Cambiar Contraseña':
                mostrarModalCambiarPassword();
                break;
            case 'Configurar Notificaciones':
                mostrarModalNotificaciones();
                break;
            case 'Tema de la Aplicación':
                mostrarModalTemas();
                break;
            default:
                mostrarToast('Función próximamente disponible', 'info');
        }
    });
    
    // ===========================
    // MODALES DE CONFIGURACIÓN
    // ===========================
    
    function mostrarModalEditarPerfil() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>Editar Perfil</h3>
                        <button class="cerrar-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="formulario-perfil">
                            <div class="campo-formulario">
                                <label>Nombre Completo</label>
                                <input type="text" value="Lucia Rodriguez" required>
                            </div>
                            <div class="campo-formulario">
                                <label>Correo Electrónico</label>
                                <input type="email" value="lucia.rodriguez@unal.edu.co" required>
                            </div>
                            <div class="campo-formulario">
                                <label>Teléfono</label>
                                <input type="tel" value="+57 300 123 4567">
                            </div>
                            <div class="campo-formulario">
                                <label>Institución</label>
                                <input type="text" value="Universidad Nacional de Colombia">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-cancelar">Cancelar</button>
                        <button class="boton-guardar">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
        
        const $modal = $(modalHtml);
        $('body').append($modal);
        
        setTimeout(() => $modal.addClass('mostrar'), 10);
        
        manejarModal($modal);
    }
    
    function mostrarModalCambiarPassword() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>Cambiar Contraseña</h3>
                        <button class="cerrar-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="formulario-password">
                            <div class="campo-formulario">
                                <label>Contraseña Actual</label>
                                <input type="password" placeholder="Ingresa tu contraseña actual" required>
                            </div>
                            <div class="campo-formulario">
                                <label>Nueva Contraseña</label>
                                <input type="password" placeholder="Ingresa la nueva contraseña" required>
                            </div>
                            <div class="campo-formulario">
                                <label>Confirmar Nueva Contraseña</label>
                                <input type="password" placeholder="Confirma la nueva contraseña" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-cancelar">Cancelar</button>
                        <button class="boton-guardar">Cambiar Contraseña</button>
                    </div>
                </div>
            </div>
        `;
        
        const $modal = $(modalHtml);
        $('body').append($modal);
        
        setTimeout(() => $modal.addClass('mostrar'), 10);
        
        manejarModal($modal);
    }
    
    function mostrarModalNotificaciones() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>Configurar Notificaciones</h3>
                        <button class="cerrar-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="configuracion-notificaciones">
                            <div class="opcion-notificacion">
                                <div class="info-opcion">
                                    <h4>Notificaciones por Email</h4>
                                    <p>Recibir actualizaciones de reportes por correo</p>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="opcion-notificacion">
                                <div class="info-opcion">
                                    <h4>Notificaciones Push</h4>
                                    <p>Notificaciones en tiempo real del sistema</p>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="opcion-notificacion">
                                <div class="info-opcion">
                                    <h4>Resumen Semanal</h4>
                                    <p>Recibir resumen de actividad cada semana</p>
                                </div>
                                <label class="toggle">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-cancelar">Cancelar</button>
                        <button class="boton-guardar">Guardar Configuración</button>
                    </div>
                </div>
            </div>
        `;
        
        const $modal = $(modalHtml);
        $('body').append($modal);
        
        setTimeout(() => $modal.addClass('mostrar'), 10);
        
        manejarModal($modal);
    }
    
    function mostrarModalTemas() {
        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>Tema de la Aplicación</h3>
                        <button class="cerrar-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="seleccion-temas">
                            <div class="opcion-tema activa" data-tema="claro">
                                <div class="preview-tema tema-claro"></div>
                                <span>Tema Claro</span>
                            </div>
                            <div class="opcion-tema" data-tema="oscuro">
                                <div class="preview-tema tema-oscuro"></div>
                                <span>Tema Oscuro</span>
                            </div>
                            <div class="opcion-tema" data-tema="auto">
                                <div class="preview-tema tema-auto"></div>
                                <span>Automático</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-cancelar">Cancelar</button>
                        <button class="boton-guardar">Aplicar Tema</button>
                    </div>
                </div>
            </div>
        `;
        
        const $modal = $(modalHtml);
        $('body').append($modal);
        
        setTimeout(() => $modal.addClass('mostrar'), 10);
        
        // Manejar selección de tema
        $modal.find('.opcion-tema').on('click', function() {
            $modal.find('.opcion-tema').removeClass('activa');
            $(this).addClass('activa');
        });
        
        manejarModal($modal);
    }
    
    function manejarModal($modal) {
        // Cerrar modal
        $modal.find('.cerrar-modal, .boton-cancelar').on('click', function() {
            cerrarModal($modal);
        });
        
        // Guardar cambios
        $modal.find('.boton-guardar').on('click', function() {
            // Simular guardado
            mostrarToast('Cambios guardados exitosamente', 'success');
            cerrarModal($modal);
        });
        
        // Cerrar con overlay
        $modal.find('.modal-overlay').on('click', function(e) {
            if (e.target === this) {
                cerrarModal($modal);
            }
        });
        
        // Cerrar con Escape
        $(document).on('keydown.modal', function(e) {
            if (e.key === 'Escape') {
                cerrarModal($modal);
            }
        });
    }
    
    function cerrarModal($modal) {
        $modal.removeClass('mostrar');
        setTimeout(() => {
            $modal.remove();
            $(document).off('keydown.modal');
        }, 300);
    }
    
    // ===========================
    // HEADER Y CONTROLES
    // ===========================
    
    // Botón de notificaciones
    $('.boton-notificaciones').on('click', function(e) {
        e.preventDefault();
        mostrarToast('Panel de notificaciones próximamente', 'info');
    });
    
    // Perfil de usuario en header
    $('.perfil-usuario').on('click', function(e) {
        e.preventDefault();
        mostrarToast('Ya estás en tu perfil', 'info');
    });
    
    // Cerrar sesión
    $('.boton-cerrar-sesion').on('click', function(e) {
        e.preventDefault();
        
        // Mostrar confirmación
        const confirmar = confirm('¿Estás seguro de que quieres cerrar sesión?');
        if (confirmar) {
            mostrarToast('Cerrando sesión...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
    
    // ===========================
    // ANIMACIONES Y EFECTOS
    // ===========================
    
    // Efecto hover en tarjetas de estadísticas
    $('.tarjeta-estadistica').hover(
        function() {
            $(this).find('.icono-estadistica').css('transform', 'scale(1.1)');
        },
        function() {
            $(this).find('.icono-estadistica').css('transform', 'scale(1)');
        }
    );
    
    // Animación de entrada
    function animarEntrada() {
        $('.tarjeta-perfil').css('opacity', '0').animate({opacity: 1}, 800);
        
        $('.tarjeta-estadistica').each(function(index) {
            $(this).css({
                opacity: '0',
                transform: 'translateY(20px)'
            }).delay(index * 100).animate({opacity: 1}, 500).css('transform', 'translateY(0)');
        });
        
        setTimeout(() => {
            $('.columna-principal').css({
                opacity: '0',
                transform: 'translateX(20px)'
            }).animate({opacity: 1}, 600).css('transform', 'translateX(0)');
        }, 400);
    }
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    function mostrarToast(mensaje, tipo = 'info') {
        const iconos = {
            'success': 'check_circle',
            'error': 'error',
            'info': 'info'
        };
        
        const $toast = $(`
            <div class="toast toast-${tipo}">
                <span class="material-symbols-outlined">${iconos[tipo]}</span>
                <span>${mensaje}</span>
            </div>
        `);
        
        $('body').append($toast);
        
        setTimeout(() => $toast.addClass('mostrar'), 100);
        
        setTimeout(() => {
            $toast.removeClass('mostrar');
            setTimeout(() => $toast.remove(), 300);
        }, 3000);
    }
    
    // ===========================
    // ATAJOS DE TECLADO
    // ===========================
    
    $(document).on('keydown', function(e) {
        // Solo si no hay modales abiertos
        if ($('.modal-overlay').length === 0) {
            switch(e.key) {
                case 'e':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        mostrarModalEditarPerfil();
                    }
                    break;
                case 'p':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        mostrarModalCambiarPassword();
                    }
                    break;
                case 'h':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        window.location.href = 'dashboard.html';
                    }
                    break;
            }
        }
    });
    
    // ===========================
    // INICIALIZACIÓN
    // ===========================
    
    function inicializar() {
        console.log('Perfil de Usuario inicializado');
        console.log('Atajos disponibles:');
        console.log('- Ctrl+E: Editar perfil');
        console.log('- Ctrl+P: Cambiar contraseña'); 
        console.log('- Ctrl+H: Ir al inicio');
        
        // Ejecutar animaciones de entrada
        animarEntrada();
    }
    
    // Ejecutar inicialización
    inicializar();
});

// ===========================
// ESTILOS ADICIONALES PARA MODALES
// ===========================

// Inyectar estilos CSS para modales
const estilosModales = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.mostrar {
    opacity: 1;
    visibility: visible;
}

.modal-contenido {
    background-color: var(--bg-primary);
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.modal-overlay.mostrar .modal-contenido {
    transform: scale(1);
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.cerrar-modal {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--text-secondary);
}

.modal-body {
    padding: 20px;
}

.campo-formulario {
    margin-bottom: 16px;
}

.campo-formulario label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: var(--text-primary);
}

.campo-formulario input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.boton-cancelar, .boton-guardar {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 500;
}

.boton-cancelar {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
}

.boton-guardar {
    background-color: var(--primary-color);
    color: white;
}

.configuracion-notificaciones {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.opcion-notificacion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background-color: var(--bg-secondary);
    border-radius: 8px;
}

.info-opcion h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
}

.info-opcion p {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
}

.toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(26px);
}

.seleccion-temas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
}

.opcion-tema {
    padding: 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.opcion-tema.activa {
    border-color: var(--primary-color);
    background-color: var(--primary-light);
}

.preview-tema {
    width: 60px;
    height: 40px;
    border-radius: 4px;
    margin: 0 auto 8px;
}

.tema-claro {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.tema-oscuro {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.tema-auto {
    background: linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #1e293b 50%, #0f172a 100%);
}
</style>
`;

$('head').append(estilosModales);