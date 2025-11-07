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
        
        // Limpiar cualquier modal residual
        $('#modal-eliminar').remove();
        $('.modal-overlay').remove();
        
        // Asegurar que el CSS esté cargado
        ensureCSS();
        
        console.log('Elementos encontrados:', {
            'tabla': $('#tabla-usuarios').length,
            'buscar': $('#buscar-usuarios').length,
            'filtro': $('#filtro-rol').length,
            'btn-refrescar': $('#btn-refrescar').length,
            'total-usuarios': $('#total-usuarios').length,
            'loading-usuarios': $('#loading-usuarios').length
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
        if ($('#tabla-usuarios').length === 0 || $('#loading-usuarios').length === 0) {
            console.error('❌ Elementos de Ver Usuarios no encontrados en el DOM');
            return false;
        }
        
        configurarEventos();
        
        // Ejecutar la carga de datos de forma asíncrona
        setTimeout(async () => {
            try {
                await cargarUsuarios();
                await cargarEstadisticas();
                console.log('✅ Datos cargados exitosamente');
            } catch (error) {
                console.error('❌ Error al cargar datos:', error);
            }
        }, 100);
        
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
        
        // Remover modales existentes
        $('#modal-eliminar').remove();
        $('.modal-overlay').remove();
        
        // Remover eventos delegados
        $(document).off('click.verusuarios', '.btn-accion');
        
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
        $('#filtro-rol').on('change.verusuarios', function() {
            console.log('📋 Cambio en filtro de rol detectado');
            console.log('📋 Nuevo valor:', $(this).val());
            console.log('📋 Texto seleccionado:', $(this).find('option:selected').text());
            console.log('📋 Elemento select:', $(this)[0]);
            aplicarFiltros();
        });
        
        // Debug del select al cargar
        setTimeout(() => {
            const select = $('#filtro-rol');
            console.log('🔧 Estado inicial del select:');
            console.log('- Valor:', select.val());
            console.log('- Texto visible:', select.find('option:selected').text());
            console.log('- Estilo computed:', window.getComputedStyle(select[0]));
        }, 1000);
        
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

        // Botón exportar usuarios - evitar duplicación
        console.log('🔍 Configurando evento exportar...');
        
        // Remover eventos previos para evitar duplicación
        $('#btn-exportar-usuarios, #btn-exportar').off('click.verusuarios');
        
        // Configurar evento una sola vez
        $(document).off('click.verusuarios', '[id^="btn-exportar"]');
        $(document).on('click.verusuarios', '[id^="btn-exportar"]', function(e) {
            e.preventDefault();
            // No detener propagación para mantener compatibilidad con handlers globales
            console.log('🖱️ Click detectado en botón exportar');
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
        
        // ===========================
        // EVENTOS DELEGADOS PARA BOTONES DE ACCIÓN
        // ===========================
        
        // Remover eventos delegados existentes para evitar duplicados
        $(document).off('click.verusuarios', '.btn-accion');
        
        // Configurar eventos delegados para botones de acción de la tabla
        $(document).on('click.verusuarios', '.btn-accion', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const accion = $(this).data('accion');
            const userId = $(this).data('usuario-id');
            
            console.log('🎯 Ver Usuarios: Botón acción clicked:', accion, 'Usuario:', userId);
            
            if (accion === 'ver') {
                console.log('📋 Ejecutando verUsuario para ID:', userId);
                window.VerUsuarios.verUsuario(userId);
            } else if (accion === 'editar') {
                console.log('✏️ Ejecutando editarUsuario para ID:', userId);
                window.VerUsuarios.editarUsuario(userId);
            } else if (accion === 'eliminar') {
                console.log('🗑️ Ejecutando confirmarEliminacion para ID:', userId);
                window.VerUsuarios.confirmarEliminacion(userId);
            }
        });
        
        console.log('✅ Eventos delegados configurados para botones de acción');
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
        // Mapear las propiedades correctas de la API
        const total = stats.total || stats.total_usuarios || 0;
        const admins = stats.administradores || stats.total_admins || 0;
        const monitores = stats.monitores || stats.total_monitores || 0;
        
        $('#total-usuarios').text(total);
        $('#total-admins').text(admins);
        $('#total-monitores').text(monitores);
        
        console.log('📊 Estadísticas actualizadas:', { total, admins, monitores });
    }
    
    // ===========================
    // FILTRADO Y BÚSQUEDA
    // ===========================
    
    function aplicarFiltros() {
        console.log('🔍 Aplicando filtros...');
        const termino = $('#buscar-usuarios').val().toLowerCase();
        const rolFiltro = $('#filtro-rol').val();
        
        console.log('🔍 Término de búsqueda:', termino);
        console.log('🔍 Filtro de rol:', rolFiltro);
        console.log('🔍 Usuarios totales:', usuarios.length);
        console.log('🔍 Texto del select:', $('#filtro-rol option:selected').text());
        
        usuariosFiltrados = usuarios.filter(usuario => {
            const coincideBusqueda = termino === '' || 
                                   usuario.nombre.toLowerCase().includes(termino) ||
                                   usuario.correo.toLowerCase().includes(termino) ||
                                   (usuario.codigo && usuario.codigo.includes(termino));
            
            const coincidenRol = rolFiltro === '' || usuario.rol === rolFiltro;
            
            return coincideBusqueda && coincidenRol;
        });
        
        console.log(`🔍 Filtrado: ${usuariosFiltrados.length} de ${usuarios.length} usuarios`);
        
        // Resetear paginación
        paginaActual = 1;
        calcularPaginacion();
        renderizarTabla();
        actualizarEstadisticasFiltradas();
    }
    
    function actualizarEstadisticasFiltradas() {
        const filtrados = usuariosFiltrados.length;
        const adminsFiltrados = usuariosFiltrados.filter(u => u.rol === 'admin').length;
        const monitoresFiltrados = usuariosFiltrados.filter(u => u.rol === 'monitor').length;
        
        console.log('📊 Actualizando estadísticas filtradas:');
        console.log('- Total filtrados:', filtrados);
        console.log('- Admins filtrados:', adminsFiltrados);
        console.log('- Monitores filtrados:', monitoresFiltrados);
        
        // Siempre actualizar las estadísticas para reflejar los filtros actuales
        $('#total-usuarios').text(filtrados);
        $('#total-admins').text(adminsFiltrados);
        $('#total-monitores').text(monitoresFiltrados);
    }
    
    // ===========================
    // RENDERIZADO DE TABLA
    // ===========================
    
    function renderizarTabla() {
        console.log('📊 Renderizando tabla de usuarios...');
        const tbody = $('#tbody-usuarios');
        
        // Limpiar completamente la tabla
        tbody.empty();
        
        const inicio = (paginaActual - 1) * usuariosPorPagina;
        const fin = inicio + usuariosPorPagina;
        const usuariosPagina = usuariosFiltrados.slice(inicio, fin);
        
        console.log(`📋 Usuarios a mostrar: ${usuariosPagina.length} (de ${usuariosFiltrados.length} filtrados)`);
        console.log('📋 Total usuarios originales:', usuarios.length);
        
        if (usuariosPagina.length === 0) {
            console.log('⚠️ No hay usuarios para mostrar, mostrando estado vacío');
            mostrarEstadoVacio();
            return;
        }
        
        // Forzar recreación completa de filas
        usuariosPagina.forEach((usuario, index) => {
            console.log(`👤 Creando fila ${index + 1} para usuario: ${usuario.nombre} (ID: ${usuario.id_usuario})`);
            const fila = crearFilaUsuario(usuario);
            tbody.append(fila);
            
            // Verificar que la fila se agregó correctamente
            const filaAgregada = tbody.find(`tr[data-usuario-id="${usuario.id_usuario}"]`);
            const botonesEnFila = filaAgregada.find('.btn-accion').length;
            console.log(`✅ Fila agregada para ${usuario.nombre}. Botones encontrados: ${botonesEnFila}`);
        });
        
        // Mostrar la tabla
        $('#tabla-usuarios').show();
        
        // Actualizar controles de paginación
        actualizarPaginacion();
    }
    
    function crearFilaUsuario(usuario) {
        console.log('🔨 Creando fila para usuario:', usuario.nombre, 'ID:', usuario.id_usuario);
        const fechaFormateada = formatearFecha(usuario.fecha_creacion);
        const badgeRol = crearBadgeRol(usuario.rol);
        
        const filaHTML = `
            <tr data-usuario-id="${usuario.id_usuario}">
                <td>
                    <div class="usuario-info">
                        <div class="avatar-usuario"></div>
                        <div class="datos-usuario">
                            <div class="nombre-usuario">${escapeHtml(usuario.nombre)}</div>
                            <div class="id-usuario">ID: ${usuario.id_usuario}</div>
                        </div>
                    </div>
                </td>
                <td><span class="correo-usuario">${escapeHtml(usuario.correo)}</span></td>
                <td><span class="codigo-usuario">${usuario.codigo || 'No asignado'}</span></td>
                <td>${badgeRol}</td>
                <td><span class="fecha-registro">${fechaFormateada}</span></td>
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
        `;
        
        console.log('✅ HTML generado para usuario', usuario.nombre, '- Contiene botón eliminar:', filaHTML.includes('btn-eliminar'));
        return $(filaHTML);
    }
    
    function mostrarEstadoVacio() {
        const tbody = $('#tbody-usuarios');
        tbody.empty();
        
        const busqueda = $('#buscar-usuarios').val();
        const filtro = $('#filtro-rol').val();
        
        let mensaje = '';
        if (busqueda || filtro) {
            mensaje = 'No se encontraron usuarios que coincidan con los filtros aplicados.';
        } else {
            mensaje = 'No hay usuarios registrados en el sistema.';
        }
        
        tbody.append(`
            <tr>
                <td colspan="6" class="texto-centrado estado-vacio">
                    <div class="mensaje-vacio">
                        <span class="material-symbols-outlined">group_off</span>
                        <p>${mensaje}</p>
                    </div>
                </td>
            </tr>
        `);
        
        $('#tabla-usuarios').show();
        $('#paginacion').hide();
    }
    
    // ===========================
    // PAGINACIÓN
    // ===========================
    
    function calcularPaginacion() {
        totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        // Asegurar que la página actual esté en rango válido
        if (paginaActual > totalPaginas) {
            paginaActual = totalPaginas;
        }
    }
    
    function actualizarPaginacion() {
        const inicio = (paginaActual - 1) * usuariosPorPagina + 1;
        const fin = Math.min(paginaActual * usuariosPorPagina, usuariosFiltrados.length);
        
        $('#info-paginacion').text(`Página ${paginaActual} de ${totalPaginas}`);
        
        // Botones de navegación
        $('#btn-anterior').prop('disabled', paginaActual === 1);
        $('#btn-siguiente').prop('disabled', paginaActual === totalPaginas);
        
        // Mostrar/ocultar paginación
        if (totalPaginas > 1) {
            $('#paginacion').show();
        } else {
            $('#paginacion').hide();
        }
    }
    
    // ===========================
    // INDICADORES VISUALES
    // ===========================
    
    function mostrarIndicadorCarga(mostrar) {
        if (mostrar) {
            $('#loading-usuarios').show();
            $('#tabla-usuarios').hide();
        } else {
            $('#loading-usuarios').hide();
            $('#tabla-usuarios').show();
        }
    }
    
    // ===========================
    // FUNCIONES DE UTILIDAD
    // ===========================
    
    function obtenerIniciales(nombre) {
        return nombre.split(' ')
                    .map(parte => parte.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('');
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function crearBadgeRol(rol) {
        const esAdmin = rol === 'admin';
        const iconoRol = esAdmin ? 'admin_panel_settings' : 'support_agent';
        const textoRol = esAdmin ? 'ADMINISTRADOR' : 'MONITOR';
        const claseRol = esAdmin ? 'badge-admin' : 'badge-monitor';
        
        return `
            <span class="badge-rol ${claseRol}">
                <span class="material-symbols-outlined">${iconoRol}</span>
                ${textoRol}
            </span>
        `;
    }
    
    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
    
    function mostrarToast(mensaje, tipo = 'info') {
        console.log(`Toast [${tipo}]: ${mensaje}`);
        
        // Crear toast visual
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        // Iconos según el tipo
        const iconos = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        
        // Colores según el tipo
        const colores = {
            success: '#10b981',
            error: '#ef4444', 
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: white; border-left: 4px solid ${colores[tipo]}; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); margin-bottom: 0.5rem; max-width: 400px;">
                <span class="material-symbols-outlined" style="color: ${colores[tipo]}; font-size: 1.25rem;">${iconos[tipo]}</span>
                <span style="color: #374151; font-weight: 500;">${escapeHtml(mensaje)}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem;">
                    <span class="material-symbols-outlined" style="font-size: 1rem;">close</span>
                </button>
            </div>
        `;
        
        // Estilos del contenedor
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 4000);
        
        // Fallback para sistemas que no soporten toast
        if (window.mostrarToast && typeof window.mostrarToast === 'function') {
            window.mostrarToast(mensaje, tipo);
        }
    }
    

    
    function verUsuario(userId) {
        console.log('🔍 verUsuario iniciado para ID:', userId);
        console.log('👥 Usuarios disponibles:', usuarios);
        
        try {
            const usuario = usuarios.find(u => u.id_usuario == userId);
            if (!usuario) {
                console.error('❌ Usuario no encontrado para ID:', userId);
                mostrarToast('Usuario no encontrado', 'error');
                return;
            }
            
            console.log('👤 Usuario encontrado:', usuario);

            // Crear modal para mostrar detalles del usuario
            const fechaFormateada = new Date(usuario.fecha_creacion).toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            console.log('📅 Fecha formateada:', fechaFormateada);

        const modalHtml = `
            <div class="modal-overlay" id="modal-ver-usuario" style="display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.5) !important; z-index: 9999 !important; visibility: visible !important; opacity: 1 !important;">
                <div class="modal" style="margin: auto !important; background: white !important; border-radius: 12px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; max-width: 500px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
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
                            <div class="avatar-usuario" style="width: 80px; height: 80px; font-size: 2rem; border-radius: 50%;"></div>
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
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">security</span>
                                    Rol del Sistema
                                </label>
                                <div style="padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
                                    ${crearBadgeRol(usuario.rol)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="boton-secundario" id="btn-cerrar-ver-usuario-footer">
                            <span class="material-symbols-outlined">close</span>
                            Cerrar
                        </button>
                        <button class="boton-principal" id="btn-editar-desde-ver" data-usuario-id="${usuario.id_usuario}">
                            <span class="material-symbols-outlined">edit</span>
                            Editar Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        console.log('🎭 Agregando modal al body...');
        $('body').append(modalHtml);
        console.log('✅ Modal agregado al DOM');
        
        // Verificar que el modal esté en el DOM
        const modalElement = $('#modal-ver-usuario');
        console.log('🔍 Modal en DOM:', modalElement.length > 0);
        console.log('🎨 Estilos del modal:', modalElement.css(['display', 'position', 'z-index', 'visibility']));
        console.log('📍 Posición del modal:', modalElement.offset());

        // Configurar eventos para cerrar el modal
        $('#btn-cerrar-ver-usuario, #btn-cerrar-ver-usuario-footer').on('click', function() {
            $('#modal-ver-usuario').remove();
        });

        // Event listener para el botón de editar
        $('#btn-editar-desde-ver').on('click', function() {
            const userId = $(this).data('usuario-id');
            console.log('🖊️ Botón editar clicked, userId:', userId);
            editarUsuario(userId);
        });

        // Cerrar modal al hacer clic fuera
        $('#modal-ver-usuario').on('click', function(e) {
            if (e.target === this) {
                $(this).remove();
            }
        });

        // Cerrar modal con ESC
        $(document).on('keydown.modal-ver-usuario', function(e) {
            if (e.key === 'Escape') {
                $('#modal-ver-usuario').remove();
                $(document).off('keydown.modal-ver-usuario');
            }
        });
        
        } catch (error) {
            console.error('❌ Error en verUsuario:', error);
            mostrarToast('Error al mostrar detalles del usuario', 'error');
        }
    }

    function editarUsuario(userId) {
        console.log('✏️ Mostrando modal de editar usuario para ID:', userId);
        
        // Cerrar modal de ver usuario si está abierto
        $('#modal-ver-usuario').remove();
        
        // Buscar usuario en la lista actual
        const usuario = usuarios.find(u => u.id_usuario === userId);
        if (!usuario) {
            console.error('❌ Usuario no encontrado:', userId);
            mostrarToast('Usuario no encontrado', 'error');
            return;
        }

        console.log('👤 Usuario encontrado para editar:', usuario);

        // Crear modal de edición dinámicamente
        const modalHtml = `
            <div class="modal-overlay" id="modal-editar-usuario" style="display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.5) !important; z-index: 9999 !important; visibility: visible !important; opacity: 1 !important; align-items: center !important; justify-content: center !important;">
                <div class="modal" style="background: white !important; border-radius: 12px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; max-width: 500px !important; width: 90% !important; max-height: 90vh !important; overflow-y: auto !important;">
                    <div class="modal-header">
                        <h3>
                            <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem;">edit</span>
                            Editar Usuario
                        </h3>
                        <button class="btn-cerrar-modal" id="btn-cerrar-editar-usuario">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-contenido">
                        <form id="form-editar-usuario" style="display: grid; gap: 1.5rem;">
                            
                            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
                                <div class="avatar-usuario" style="width: 60px; height: 60px; font-size: 1.5rem; border-radius: 50%;"></div>
                                <div>
                                    <p style="margin: 0; color: #64748b; font-size: 1rem;">Editando usuario</p>
                                    <h4 style="margin: 0.25rem 0 0 0; color: #1e293b;">${escapeHtml(usuario.nombre)}</h4>
                                </div>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">person</span>
                                    Nombre Completo
                                </label>
                                <input type="text" id="edit-nombre" value="${escapeHtml(usuario.nombre)}" 
                                       style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem;" 
                                       required>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">email</span>
                                    Correo Electrónico
                                </label>
                                <input type="email" id="edit-correo" value="${escapeHtml(usuario.correo)}" 
                                       style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem;" 
                                       required>
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">badge</span>
                                    Código de Estudiante
                                </label>
                                <input type="text" id="edit-codigo" value="${usuario.codigo || ''}" 
                                       style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem; font-family: monospace;">
                            </div>
                            
                            <div>
                                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                    <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; font-size: 1.2rem;">security</span>
                                    Rol del Sistema
                                </label>
                                <select id="edit-rol" style="width: 100%; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 1rem;" required>
                                    <option value="estudiante" ${usuario.rol === 'estudiante' ? 'selected' : ''}>👤 Estudiante</option>
                                    <option value="monitor" ${usuario.rol === 'monitor' ? 'selected' : ''}>👁️ Monitor</option>
                                    <option value="admin" ${usuario.rol === 'admin' ? 'selected' : ''}>👑 Administrador</option>
                                </select>
                            </div>
                            
                            <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 1rem;">
                                <div style="display: flex; align-items: start; gap: 0.5rem;">
                                    <span class="material-symbols-outlined" style="color: #f59e0b; font-size: 1.2rem;">info</span>
                                    <div>
                                        <p style="margin: 0; font-size: 0.9rem; color: #92400e;">
                                            <strong>Nota:</strong> Los cambios se aplicarán inmediatamente después de guardar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="boton-secundario" id="btn-cancelar-edicion">
                            <span class="material-symbols-outlined">close</span>
                            Cancelar
                        </button>
                        <button type="button" class="boton-principal" id="btn-guardar-edicion" data-usuario-id="${usuario.id_usuario}">
                            <span class="material-symbols-outlined">save</span>
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        $('body').append(modalHtml);

        // Event listeners para el modal
        $('#btn-cerrar-editar-usuario, #btn-cancelar-edicion').on('click', function() {
            $('#modal-editar-usuario').remove();
        });

        // Event listener para guardar cambios
        $('#btn-guardar-edicion').on('click', function() {
            guardarCambiosUsuario(userId);
        });

        // Cerrar modal al hacer clic fuera
        $('#modal-editar-usuario').on('click', function(e) {
            if (e.target === this) {
                $(this).remove();
            }
        });
    }

    async function guardarCambiosUsuario(userId) {
        console.log('💾 Guardando cambios para usuario ID:', userId);

        // Obtener datos del formulario
        const nombre = $('#edit-nombre').val().trim();
        const correo = $('#edit-correo').val().trim();
        const codigo = $('#edit-codigo').val().trim();
        const rol = $('#edit-rol').val();

        // Validaciones básicas
        if (!nombre || !correo || !rol) {
            mostrarToast('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            mostrarToast('Por favor ingresa un correo electrónico válido', 'error');
            return;
        }

        // Deshabilitar botón mientras se procesa
        const btnGuardar = $('#btn-guardar-edicion');
        const textoOriginal = btnGuardar.html();
        btnGuardar.prop('disabled', true).html('<span class="material-symbols-outlined">sync</span> Guardando...');

        try {
            // Preparar datos para enviar
            const datosUsuario = {
                nombre: nombre,
                correo: correo,
                codigo: codigo || null,
                rol: rol
            };

            console.log('📤 Enviando datos:', datosUsuario);

            // Realizar petición al servidor
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datosUsuario)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar usuario');
            }

            const result = await response.json();
            console.log('✅ Usuario actualizado:', result);

            // Cerrar modal
            $('#modal-editar-usuario').remove();

            // Mostrar mensaje de éxito
            mostrarToast('Usuario actualizado correctamente', 'success');

            // Recargar la lista de usuarios para mostrar los cambios
            await cargarUsuarios();

        } catch (error) {
            console.error('❌ Error al guardar cambios:', error);
            mostrarToast(error.message || 'Error al actualizar usuario', 'error');
        } finally {
            // Restaurar botón
            btnGuardar.prop('disabled', false).html(textoOriginal);
        }
    }

    function confirmarEliminacion(userId) {
        console.log('🗑️ confirmarEliminacion iniciado para ID:', userId);
        console.log('👥 Usuarios disponibles:', usuarios);
        
        const usuario = usuarios.find(u => u.id_usuario == userId);
        if (!usuario) {
            console.error('❌ Usuario no encontrado para ID:', userId);
            mostrarToast('Usuario no encontrado', 'error');
            return;
        }
        
        console.log('👤 Usuario encontrado para eliminar:', usuario);
        
        usuarioAEliminar = userId;
        
        // Crear modal de eliminación dinámicamente
        const modalHtml = `
            <div class="modal-overlay" id="modal-eliminar" style="display: none; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.5) !important; z-index: 9999 !important; align-items: center; justify-content: center;">
                <div class="modal" style="margin: auto !important; background: white !important; border-radius: 12px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important; max-width: 400px !important; width: 90% !important;">
                    <div class="modal-header">
                        <h3>
                            <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem; color: #dc2626;">warning</span>
                            Confirmar Eliminación
                        </h3>
                        <button class="btn-cerrar-modal" id="btn-cerrar-eliminar">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="modal-contenido" style="padding: 1.5rem;">
                        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                        <p class="nombre-usuario-eliminar" style="font-weight: 600; color: #dc2626;">${escapeHtml(usuario.nombre)} (${escapeHtml(usuario.correo)})</p>
                        <p class="texto-advertencia" style="color: #dc2626; font-size: 0.9rem;">Esta acción no se puede deshacer.</p>
                    </div>
                    <div class="modal-footer" style="padding: 1rem 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="boton-secundario" id="btn-cancelar-eliminar">
                            <span class="material-symbols-outlined">close</span>
                            Cancelar
                        </button>
                        <button class="boton-peligro" id="btn-confirmar-eliminar" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                            <span class="material-symbols-outlined">delete</span>
                            Eliminar Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        $('#modal-eliminar').remove();
        
        // Agregar modal al body
        console.log('🎭 Agregando modal de eliminación al body...');
        $('body').append(modalHtml);
        console.log('✅ Modal de eliminación agregado al DOM');
        
        // Mostrar el modal
        $('#modal-eliminar').css('display', 'flex').show();
        
        // Configurar eventos para cerrar modal
        $('#btn-cerrar-eliminar, #btn-cancelar-eliminar').on('click', function() {
            $('#modal-eliminar').remove();
        });
        
        // Configurar evento para confirmar eliminación
        $('#btn-confirmar-eliminar').on('click', function() {
            $('#modal-eliminar').remove();
            eliminarUsuario(userId);
        });
        
        // Cerrar modal al hacer clic fuera
        $('#modal-eliminar').on('click', function(e) {
            if (e.target === this) {
                $(this).remove();
            }
        });
        
        // Cerrar modal con ESC
        $(document).on('keydown.modal-eliminar', function(e) {
            if (e.key === 'Escape') {
                $('#modal-eliminar').remove();
                $(document).off('keydown.modal-eliminar');
            }
        });
    }

    async function eliminarUsuario(userId) {
        try {
            mostrarToast('Eliminando usuario...', 'info');
            
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    mostrarToast('Usuario eliminado exitosamente', 'success');
                    // Recargar la lista de usuarios
                    await cargarUsuarios();
                    await cargarEstadisticas();
                } else {
                    throw new Error(result.message || 'Error al eliminar usuario');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            mostrarToast(error.message || 'Error al eliminar el usuario', 'error');
        }
    }

    // ===========================
    // EXPORTACIÓN DE DATOS
    // ===========================
    
    let exportandoEnProceso = false; // Flag para evitar múltiples exportaciones
    
    function exportarUsuarios() {
        console.log('📊 Iniciando exportación de usuarios...');
        
        // Evitar ejecuciones múltiples
        if (exportandoEnProceso) {
            console.log('⚠️ Exportación ya en proceso, cancelando...');
            return;
        }
        
        exportandoEnProceso = true;
        console.log('👥 Usuarios filtrados:', usuariosFiltrados);
        
        try {
            if (usuariosFiltrados.length === 0) {
                console.log('⚠️ No hay usuarios para exportar');
                return;
            }

            console.log(`📋 Exportando ${usuariosFiltrados.length} usuarios...`);

            // Preparar datos para exportar
            const datosExport = usuariosFiltrados.map(usuario => ({
                'ID': usuario.id_usuario,
                'Nombre': usuario.nombre,
                'Correo': usuario.correo,
                'Código': usuario.codigo || 'No asignado',
                'Rol': usuario.rol === 'admin' ? 'Administrador' : 'Monitor',
                'Fecha de Registro': formatearFecha(usuario.fecha_creacion)
            }));

            // Crear CSV
            const headers = Object.keys(datosExport[0]);
            const csvContent = [
                headers.join(','),
                ...datosExport.map(row => 
                    headers.map(header => `"${row[header]}"`).join(',')
                )
            ].join('\n');

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ ${usuariosFiltrados.length} usuarios exportados exitosamente`);
            
        } catch (error) {
            console.error('Error al exportar usuarios:', error);
        } finally {
            // Resetear flag de exportación
            exportandoEnProceso = false;
            console.log('✅ Exportación completada, flag reseteado');
        }
    }
    
    // ===========================
    // API PÚBLICA DEL MÓDULO
    // ===========================
    
    return {
        init: init,
        cleanup: cleanup,
        aplicarFiltros: aplicarFiltros,
        verUsuario: verUsuario,
        editarUsuario: editarUsuario,
        guardarCambiosUsuario: guardarCambiosUsuario,
        confirmarEliminacion: confirmarEliminacion,
        exportarUsuarios: exportarUsuarios,
        cargarUsuarios: cargarUsuarios,
        cargarEstadisticas: cargarEstadisticas
    };
    
})(); // IIFE para crear el módulo

// Verificar que el módulo se cargó correctamente
console.log('✅ Módulo VerUsuarios cargado:', typeof window.VerUsuarios, window.VerUsuarios);

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
    console.log('=== SPA Page Change Event RECIBIDO ===');
    console.log('Página:', e.detail.page);
    console.log('Configuración:', e.detail.config);
    
    // NOTA: La inicialización para SPA ahora se maneja desde spa-navigation.js
    // para evitar conflictos y duplicación de lógica
    if (e.detail.page === 'ver-usuarios') {
        console.log('🎯 Ver Usuarios detectado vía SPA - delegando a spa-navigation.js');
        // Ya no hacemos nada aquí, spa-navigation.js se encarga
    } else {
        console.log('📄 Página diferente, no es ver-usuarios');
    }
});