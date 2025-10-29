// ===========================
// MÓDULO VER USUARIOS
// ===========================

window.VerUsuarios = (function() {
    
    // ===========================
    // VARIABLES GLOBALES
    // ===========================
    
    let usuarios = [];
    let usuariosFiltrados = [];
    let paginaActual = 1;
    let usuariosPorPagina = 10;
    let totalPaginas = 1;
    let usuarioAEliminar = null;
    let isInitialized = false;
    
    console.log('📦 Módulo Ver Usuarios definido');
    
    // ===========================
    // FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // ===========================
    
    function init() {
        if (isInitialized) {
            console.log('🔄 Ver Usuarios ya inicializado, reiniciando...');
            cleanup();
        }
        
        console.log('🚀 Inicializando Ver Usuarios...');
        
        // Asegurar que el CSS esté cargado
        ensureCSS();
        
        console.log('Elementos encontrados:', {
            'tabla': $('#tabla-usuarios').length,
            'buscar': $('#buscar-usuarios').length,
            'filtro': $('#filtro-rol').length,
            'btn-refrescar': $('#btn-refrescar').length,
            'total-usuarios': $('#total-usuarios').length,
            'indicador-carga': $('#indicador-carga').length
        });
        
        // Verificar que los estilos se estén aplicando
        setTimeout(() => {
            const tabla = $('#tabla-usuarios')[0];
            if (tabla) {
                const computedStyle = window.getComputedStyle(tabla);
                console.log('🎨 Estilos aplicados a tabla:', {
                    display: computedStyle.display,
                    width: computedStyle.width,
                    backgroundColor: computedStyle.backgroundColor
                });
            }
        }, 100);
        
        // Verificar si los elementos existen
        if ($('#tabla-usuarios').length === 0) {
            console.error('❌ Elementos de Ver Usuarios no encontrados en el DOM');
            return false;
        }
        
        configurarEventos();
        cargarUsuarios();
        cargarEstadisticas();
        
        isInitialized = true;
        console.log('✅ Ver Usuarios inicializado completamente');
        return true;
    }
    
    function ensureCSS() {
        const cssId = 'css-ver-usuarios';
        const existingCSS = document.getElementById(cssId);
        
        if (!existingCSS) {
            console.log('🎨 Cargando CSS de Ver Usuarios...');
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = '/css/ver-usuarios.css'; // Ruta absoluta
            link.onload = function() {
                console.log('✅ CSS de Ver Usuarios cargado exitosamente');
            };
            link.onerror = function() {
                console.error('❌ Error al cargar CSS de Ver Usuarios');
            };
            document.head.appendChild(link);
        } else {
            console.log('✅ CSS de Ver Usuarios ya está cargado');
        }
        
        // También asegurar que components.css esté cargado
        if (!document.querySelector('link[href*="components.css"]')) {
            console.log('🎨 Cargando CSS de componentes...');
            const componentsLink = document.createElement('link');
            componentsLink.rel = 'stylesheet';
            componentsLink.href = '/css/components.css'; // Ruta absoluta
            document.head.appendChild(componentsLink);
        }
    }
    
    function cleanup() {
        console.log('🧹 Limpiando Ver Usuarios...');
        
        // Remover event listeners con namespace
        $('#buscar-usuarios').off('.verusuarios');
        $('#filtro-rol').off('.verusuarios');
        $('#btn-refrescar').off('.verusuarios');
        $('#btn-nuevo-usuario').off('.verusuarios');
        $('#btn-anterior').off('.verusuarios');
        $('#btn-siguiente').off('.verusuarios');
        $('#btn-cerrar-eliminar, #btn-cancelar-eliminar').off('.verusuarios');
        $('#btn-confirmar-eliminar').off('.verusuarios');
        $('#modal-eliminar').off('.verusuarios');
        
        // Limpiar variables
        usuarios = [];
        usuariosFiltrados = [];
        paginaActual = 1;
        usuarioAEliminar = null;
        isInitialized = false;
    }
    
    // ===========================
    // CONFIGURACIÓN DE EVENTOS
    // ===========================
    
    function configurarEventos() {
        console.log('Configurando eventos de Ver Usuarios...');
        
        // Remover event listeners existentes para evitar duplicados
        $('#buscar-usuarios').off('input.verusuarios');
        $('#filtro-rol').off('change.verusuarios');
        $('#btn-refrescar').off('click.verusuarios');
        $('#btn-nuevo-usuario').off('click.verusuarios');
        $('#btn-anterior').off('click.verusuarios');
        $('#btn-siguiente').off('click.verusuarios');
        $('#btn-cerrar-eliminar, #btn-cancelar-eliminar').off('click.verusuarios');
        $('#btn-confirmar-eliminar').off('click.verusuarios');
        $('#modal-eliminar').off('click.verusuarios');
        
        // Búsqueda en tiempo real
        $('#buscar-usuarios').on('input.verusuarios', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                aplicarFiltros();
            }, 300);
        });
        
        // Filtro de rol
        $('#filtro-rol').on('change.verusuarios', aplicarFiltros);
        
        // Botón refrescar
        $('#btn-refrescar').on('click.verusuarios', function() {
            cargarUsuarios();
            cargarEstadisticas();
        });
        
        // Botón nuevo usuario
        $('#btn-nuevo-usuario').on('click.verusuarios', function() {
            if (window.spaNav) {
                window.spaNav.navigateTo('crear-usuario');
            } else {
                window.location.href = 'crear-usuario.html';
            }
        });

        // Botón exportar usuarios (si existe)
        $('#btn-exportar-usuarios').on('click.verusuarios', function() {
            exportarUsuarios();
        });
        
        // Paginación
        $('#btn-anterior').on('click.verusuarios', function() {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTabla();
            }
        });
        
        $('#btn-siguiente').on('click.verusuarios', function() {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarTabla();
            }
        });
        
        // Modal de eliminación
        $('#btn-cerrar-eliminar, #btn-cancelar-eliminar').on('click.verusuarios', function() {
            $('#modal-eliminar').hide();
            usuarioAEliminar = null;
        });
        
        $('#btn-confirmar-eliminar').on('click.verusuarios', function() {
            if (usuarioAEliminar) {
                eliminarUsuario(usuarioAEliminar);
                $('#modal-eliminar').hide();
                usuarioAEliminar = null;
            }
        });
        
        // Cerrar modal al hacer clic fuera
        $('#modal-eliminar').on('click.verusuarios', function(e) {
            if (e.target === this) {
                $(this).hide();
                usuarioAEliminar = null;
            }
        });
    }
    
    // ===========================
    // CARGA DE DATOS
    // ===========================
    
    async function cargarUsuarios() {
        try {
            mostrarIndicadorCarga(true);
            console.log('📡 Cargando usuarios desde API...');
            
            const response = await fetch('/api/users', {
                method: 'GET',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Respuesta del servidor:', response.status, response.statusText);
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para ver la lista de usuarios. Solo los administradores pueden acceder.');
                } else if (response.status === 401) {
                    throw new Error('No estás autenticado. Por favor, inicia sesión.');
                } else {
                    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                }
            }
            
            const result = await response.json();
            console.log('📊 Resultado de la API:', result);
            
            if (result.success && result.data) {
                usuarios = result.data;
                usuariosFiltrados = [...usuarios];
                console.log('👥 Usuarios cargados:', usuarios.length);
                
                aplicarFiltros();
                mostrarIndicadorCarga(false);
                console.log('✅ Tabla de usuarios renderizada');
            } else {
                throw new Error(result.message || 'Error al cargar usuarios');
            }
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            mostrarIndicadorCarga(false);
            mostrarEstadoVacio();
            mostrarToast(error.message || 'Error al cargar la lista de usuarios', 'error');
        }
    }
    
    async function cargarEstadisticas() {
        try {
            const response = await fetch('/api/users/stats', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Respuesta de estadísticas:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Estadísticas recibidas:', result);
                
                if (result.success && result.data) {
                    actualizarEstadisticas(result.data);
                }
            } else {
                console.log('Error al cargar estadísticas, usando datos locales');
                // Usar datos locales como fallback
                actualizarEstadisticas({
                    total_usuarios: usuarios.length,
                    total_admins: usuarios.filter(u => u.rol === 'admin').length,
                    total_monitores: usuarios.filter(u => u.rol === 'monitor').length
                });
            }
            
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // Usar datos locales como fallback
            actualizarEstadisticas({
                total_usuarios: usuarios.length,
                total_admins: usuarios.filter(u => u.rol === 'admin').length,
                total_monitores: usuarios.filter(u => u.rol === 'monitor').length
            });
        }
    }
    
    function actualizarEstadisticas(stats) {
        console.log('📊 Actualizando estadísticas con:', stats);
        
        // Mapear las propiedades correctas de la API
        const total = stats.total || usuarios.length;
        const admins = stats.administradores || usuarios.filter(u => u.rol === 'admin').length;
        const monitores = stats.monitores || usuarios.filter(u => u.rol === 'monitor').length;
        
        console.log('📊 Valores calculados:', { total, admins, monitores });
        
        $('#total-usuarios').text(total);
        $('#total-admins').text(admins);
        $('#total-monitores').text(monitores);
        
        console.log('📊 Elementos actualizados en DOM');
    }
    
    // ===========================
    // RENDERIZADO DE LA TABLA
    // ===========================
    
    function renderizarTabla() {
        const tbody = $('#tbody-usuarios');
        tbody.empty();
        
        // Calcular usuarios para la página actual
        const inicio = (paginaActual - 1) * usuariosPorPagina;
        const fin = inicio + usuariosPorPagina;
        const usuariosPagina = usuariosFiltrados.slice(inicio, fin);
        
        if (usuariosPagina.length === 0) {
            mostrarEstadoVacio();
            return;
        }
        
        usuariosPagina.forEach(usuario => {
            const fila = crearFilaUsuario(usuario);
            tbody.append(fila);
        });
        
        mostrarTabla(true);
        actualizarPaginacion();
    }
    
    function crearFilaUsuario(usuario) {
        const iniciales = obtenerIniciales(usuario.nombre);
        const fechaFormateada = formatearFecha(usuario.fecha_creacion);
        const rolBadge = crearBadgeRol(usuario.rol);
        
        return $(`
            <tr data-usuario-id="${usuario.id_usuario}">
                <td>
                    <div class="usuario-info">
                        <div class="avatar-usuario">${iniciales}</div>
                        <div class="datos-usuario">
                            <div class="nombre-usuario">${escapeHtml(usuario.nombre)}</div>
                            <div class="id-usuario">ID: ${usuario.id_usuario}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="correo-usuario">${escapeHtml(usuario.correo)}</span>
                </td>
                <td>
                    <span class="codigo-usuario">${usuario.codigo || 'No asignado'}</span>
                </td>
                <td>${rolBadge}</td>
                <td>
                    <span class="fecha-registro">${fechaFormateada}</span>
                </td>
                <td>
                    <div class="acciones-usuario">
                        <button class="btn-accion btn-ver" data-accion="ver" data-usuario-id="${usuario.id_usuario}" title="Ver usuario">
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button class="btn-accion btn-editar" data-accion="editar" data-usuario-id="${usuario.id_usuario}" title="Editar usuario">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="btn-accion btn-eliminar" data-accion="eliminar" data-usuario-id="${usuario.id_usuario}" title="Eliminar usuario">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    }
    
    function obtenerIniciales(nombre) {
        return nombre.split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }
    
    function crearBadgeRol(rol) {
        const rolesMapa = {
            'admin': { texto: 'Administrador', clase: 'badge-admin', icono: 'admin_panel_settings' },
            'monitor': { texto: 'Monitor', clase: 'badge-monitor', icono: 'monitor_heart' }
        };
        
        const rolInfo = rolesMapa[rol] || { texto: rol, clase: 'badge-monitor', icono: 'person' };
        
        return `
            <span class="badge-rol ${rolInfo.clase}">
                <span class="material-symbols-outlined" style="font-size: 0.8rem;">${rolInfo.icono}</span>
                ${rolInfo.texto}
            </span>
        `;
    }
    
    function formatearFecha(fechaString) {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
    
    // ===========================
    // FILTROS Y BÚSQUEDA
    // ===========================
    
    function aplicarFiltros() {
        const textoBusqueda = $('#buscar-usuarios').val().toLowerCase().trim();
        const filtroRol = $('#filtro-rol').val();
        
        usuariosFiltrados = usuarios.filter(usuario => {
            // Filtro de texto
            const coincideTexto = !textoBusqueda || 
                usuario.nombre.toLowerCase().includes(textoBusqueda) ||
                usuario.correo.toLowerCase().includes(textoBusqueda) ||
                (usuario.codigo && usuario.codigo.toLowerCase().includes(textoBusqueda));
            
            // Filtro de rol
            const coincideRol = !filtroRol || usuario.rol === filtroRol;
            
            return coincideTexto && coincideRol;
        });
        
        // Resetear paginación
        paginaActual = 1;
        totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
        
        renderizarTabla();
        
        console.log(`Filtros aplicados. ${usuariosFiltrados.length} usuarios encontrados.`);
    }
    
    // ===========================
    // PAGINACIÓN
    // ===========================
    
    function actualizarPaginacion() {
        totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
        
        $('#btn-anterior').prop('disabled', paginaActual <= 1);
        $('#btn-siguiente').prop('disabled', paginaActual >= totalPaginas);
        $('#info-paginacion').text(`Página ${paginaActual} de ${totalPaginas}`);
        
        if (totalPaginas > 1) {
            $('#paginacion-usuarios').show();
        } else {
            $('#paginacion-usuarios').hide();
        }
    }
    
    // ===========================
    // ESTADOS DE LA INTERFAZ
    // ===========================
    
    function mostrarIndicadorCarga(mostrar) {
        console.log('🔄 Indicador de carga:', mostrar ? 'MOSTRAR' : 'OCULTAR');
        if (mostrar) {
            $('#indicador-carga').show();
            $('#tabla-usuarios').hide();
            $('#estado-vacio').hide();
        } else {
            $('#indicador-carga').hide();
            $('#tabla-usuarios').show();
        }
    }
    
    function mostrarTabla(mostrar) {
        if (mostrar) {
            $('#tabla-usuarios').show();
            $('#estado-vacio').hide();
        } else {
            $('#tabla-usuarios').hide();
        }
    }
    
    function mostrarEstadoVacio() {
        $('#loading-usuarios').hide();
        $('#tabla-usuarios').hide();
        $('#estado-vacio').show();
        $('#paginacion-usuarios').hide();
    }
    
    // ===========================
    // ELIMINACIÓN DE USUARIOS
    // ===========================
    
    async function eliminarUsuario(userId) {
        try {
            mostrarToast('Eliminando usuario...', 'info');
            
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include', // Incluir cookies de sesión
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta de eliminación:', response.status, response.statusText);
            
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('No tienes permisos para eliminar usuarios');
                } else if (response.status === 401) {
                    throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente');
                } else if (response.status === 404) {
                    throw new Error('El usuario no existe o ya fue eliminado');
                } else {
                    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                }
            }
            
            const result = await response.json();
            console.log('Resultado de eliminación:', result);
            
            if (result.success) {
                mostrarToast('Usuario eliminado exitosamente', 'success');
                
                // Recargar datos
                await cargarUsuarios();
                await cargarEstadisticas();
                
                console.log('✅ Usuario eliminado y datos actualizados');
            } else {
                throw new Error(result.message || 'Error al eliminar usuario');
            }
            
        } catch (error) {
            console.error('❌ Error al eliminar usuario:', error);
            mostrarToast(error.message || 'Error al eliminar el usuario', 'error');
        }
    }
    
    // Acciones de la tabla (delegated events para dinámico)
    $(document).on('click', '.btn-accion', function() {
        const accion = $(this).data('accion');
        const userId = $(this).data('usuario-id');
        
        if (accion === 'ver') {
            verUsuario(userId);
        } else if (accion === 'editar') {
            editarUsuario(userId);
        } else if (accion === 'eliminar') {
            confirmarEliminacion(userId);
        }
    });
    
    function verUsuario(userId) {
        const usuario = usuarios.find(u => u.id_usuario == userId);
        if (!usuario) {
            mostrarToast('Usuario no encontrado', 'error');
            return;
        }

        // Crear modal para mostrar detalles del usuario
        const fechaFormateada = new Date(usuario.fecha_creacion).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const modalHtml = `
            <div class="modal-overlay" id="modal-ver-usuario" style="display: flex;">
                <div class="modal">
                    <div class="modal-header">
                        <h3>
                            <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem;">person</span>
                            Detalles del Usuario
                        </h3>
                        <button class="btn-cerrar-modal" id="btn-cerrar-ver-usuario">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-contenido">
                        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
                            <div class="avatar-usuario" style="width: 80px; height: 80px; font-size: 2rem;">
                                ${obtenerIniciales(usuario.nombre)}
                            </div>
                            <div>
                                <h2 style="margin: 0 0 0.5rem 0; color: #1e293b;">${escapeHtml(usuario.nombre)}</h2>
                                <p style="margin: 0; color: #64748b; font-size: 1.1rem;">${crearBadgeRol(usuario.rol).replace('badge-rol', 'badge-rol').replace('badge-', 'badge-')}</p>
                            </div>
                        </div>
                        
                        <div style="display: grid; gap: 1.5rem;">
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">email</span>
                                    Correo Electrónico
                                </label>
                                <p style="margin: 0; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">${escapeHtml(usuario.correo)}</p>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">badge</span>
                                    Código de Estudiante
                                </label>
                                <p style="margin: 0; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937; font-family: monospace; font-size: 1.1rem;">${usuario.codigo || 'No asignado'}</p>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">schedule</span>
                                    Fecha de Registro
                                </label>
                                <p style="margin: 0; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">${fechaFormateada}</p>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">fingerprint</span>
                                    ID de Usuario
                                </label>
                                <p style="margin: 0; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937; font-family: monospace;">#${usuario.id_usuario}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-secundario" id="btn-cerrar-detalle">
                            <span class="material-symbols-outlined">close</span>
                            Cerrar
                        </button>
                        <button class="boton-principal" onclick="editarUsuario(${usuario.id_usuario}); $('#modal-ver-usuario').remove();">
                            <span class="material-symbols-outlined">edit</span>
                            Editar Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        $('#modal-ver-usuario').remove();
        
        // Agregar modal al body
        $('body').append(modalHtml);
        
        // Event listeners para cerrar el modal
        $('#btn-cerrar-ver-usuario, #btn-cerrar-detalle').on('click', function() {
            $('#modal-ver-usuario').remove();
        });
        
        // Cerrar modal al hacer clic fuera
        $('#modal-ver-usuario').on('click', function(e) {
            if (e.target === this) {
                $('#modal-ver-usuario').remove();
            }
        });
        
        console.log('Ver usuario:', usuario);
    }
    
    function editarUsuario(userId) {
        const usuario = usuarios.find(u => u.id_usuario == userId);
        if (!usuario) {
            mostrarToast('Usuario no encontrado', 'error');
            return;
        }

        // Mostrar confirmación antes de editar
        const confirmacion = confirm(`¿Deseas editar el usuario "${usuario.nombre}"?\n\nSerás redirigido a la página de edición.`);
        
        if (confirmacion) {
            mostrarToast(`Cargando editor para ${usuario.nombre}...`, 'info');
            
            // Guardar datos del usuario en sessionStorage para la página de edición
            sessionStorage.setItem('editarUsuario', JSON.stringify({
                id: userId,
                nombre: usuario.nombre,
                correo: usuario.correo,
                codigo: usuario.codigo,
                rol: usuario.rol
            }));
            
            // Redirigir a la página de crear/editar usuario
            setTimeout(() => {
                if (window.spaNav) {
                    window.spaNav.navigateTo('crear-usuario');
                } else {
                    window.location.href = 'crear-usuario.html';
                }
            }, 500);
        }
    }
    
    function confirmarEliminacion(userId) {
        const usuario = usuarios.find(u => u.id_usuario == userId);
        if (!usuario) {
            mostrarToast('Usuario no encontrado', 'error');
            return;
        }

        // Validar que no sea el propio usuario logueado
        const usuarioActual = window.currentUser || {};
        if (usuarioActual.id_usuario && usuarioActual.id_usuario == userId) {
            mostrarToast('No puedes eliminar tu propia cuenta', 'warning');
            return;
        }

        // Validar que no sea el último administrador
        const administradores = usuarios.filter(u => u.rol === 'admin');
        if (usuario.rol === 'admin' && administradores.length <= 1) {
            mostrarToast('No se puede eliminar el último administrador del sistema', 'warning');
            return;
        }

        usuarioAEliminar = userId;
        $('.nombre-usuario-eliminar').text(usuario.nombre);
        
        // Actualizar el texto del modal con información adicional
        let textoAdvertencia = 'Esta acción no se puede deshacer.';
        if (usuario.rol === 'admin') {
            textoAdvertencia += ' Estás eliminando una cuenta de administrador.';
        }
        $('.texto-advertencia').text(textoAdvertencia);
        
        $('#modal-eliminar').show();
    }
    
    // ===========================
    // FUNCIÓN DE TOAST
    // ===========================
    
    function mostrarToast(mensaje, tipo = 'info') {
        // Crear elemento toast
        const toastId = 'toast-' + Date.now();
        const iconos = {
            'success': 'check_circle',
            'error': 'error',
            'warning': 'warning',
            'info': 'info'
        };
        
        const colores = {
            'success': '#22c55e',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        
        const toast = $(`
            <div class="toast" id="${toastId}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid ${colores[tipo]};
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1001;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
            ">
                <span class="material-symbols-outlined" style="color: ${colores[tipo]}; font-size: 1.25rem;">
                    ${iconos[tipo]}
                </span>
                <span style="color: #374151; font-weight: 500;">${mensaje}</span>
                <button onclick="$('#${toastId}').remove()" style="
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0;
                    margin-left: auto;
                ">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `);
        
        $('body').append(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.css('transform', 'translateX(0)');
        }, 100);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            toast.css('transform', 'translateX(100%)');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    // ===========================
    // FUNCIONES ADICIONALES
    // ===========================
    
    function exportarUsuarios() {
        if (!usuarios || usuarios.length === 0) {
            mostrarToast('No hay usuarios para exportar', 'warning');
            return;
        }
        
        try {
            // Preparar datos para CSV
            const datosCSV = usuarios.map(usuario => ({
                'ID': usuario.id_usuario,
                'Nombre': usuario.nombre,
                'Correo': usuario.correo,
                'Código': usuario.codigo || 'No asignado',
                'Rol': usuario.rol,
                'Fecha de Registro': new Date(usuario.fecha_creacion).toLocaleDateString('es-CO')
            }));
            
            // Crear CSV
            const headers = Object.keys(datosCSV[0]);
            const csvContent = [
                headers.join(','),
                ...datosCSV.map(fila => headers.map(header => 
                    `"${String(fila[header]).replace(/"/g, '""')}"`
                ).join(','))
            ].join('\n');
            
            // Descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            mostrarToast('Lista de usuarios exportada exitosamente', 'success');
            
        } catch (error) {
            console.error('Error al exportar usuarios:', error);
            mostrarToast('Error al exportar la lista de usuarios', 'error');
        }
    }

    // ===========================
    // API PÚBLICA DEL MÓDULO
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
    console.log('📦 Ver Usuarios: DOM Ready');
    
    // Inicializar si estamos en la página correcta
    if (window.location.pathname.includes('ver-usuarios.html')) {
        console.log('🎯 Página ver-usuarios detectada directamente');
        VerUsuarios.init();
    }
});

// Escuchar cambios de página SPA
document.addEventListener('spaPageChange', function(e) {
    console.log('=== SPA Page Change Event ===');
    console.log('Página:', e.detail.page);
    console.log('Configuración:', e.detail.config);
    
    if (e.detail.page === 'ver-usuarios') {
        console.log('🎯 Ver Usuarios detectado vía SPA - Inicializando...');
        // Delay más largo para asegurar que CSS se cargue
        setTimeout(() => {
            VerUsuarios.init();
        }, 300);
    }
});