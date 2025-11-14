/**
 * SISTEMA DE NOTIFICACIONES
 * Gestiona la carga, visualización y actualización de notificaciones en tiempo real
 */

class NotificationManager {
    constructor() {
        this.notificationBtn = null;
        this.notificationPanel = null;
        this.notificationContent = null;
        this.notificationBadge = null;
        this.btnMarcarTodas = null;
        this.refreshInterval = null;
        this.isPanelOpen = false;
        this.currentPage = 1;
        this.limit = 10;
        this.lastNotificationCount = 0;
        this.hasUrgentNotifications = false;
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Buscar elementos en el DOM
        this.notificationBtn = document.getElementById('btnNotificaciones');
        this.notificationPanel = document.getElementById('panelNotificaciones');
        this.notificationContent = document.getElementById('contenidoNotificaciones');
        this.notificationBadge = document.getElementById('badgeNotificaciones');
        this.btnMarcarTodas = document.getElementById('btnMarcarTodas');
        
        // Si no existen los elementos, intentar nuevamente después de cargar componentes
        if (!this.notificationBtn) {
            setTimeout(() => this.init(), 500);
            return;
        }
        
        this.setupEventListeners();
        this.loadNotifications();
        this.updateBadge();
        
        // Actualizar cada 5 segundos para tiempo real
        this.startAutoRefresh();
    }
    
    setupEventListeners() {
        // Toggle del panel
        this.notificationBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cerrar dropdown de perfil si está abierto
            $('.user-dropdown, .dropdown-perfil').removeClass('open');
            $('.menu-desplegable').removeClass('mostrar');
            this.togglePanel();
        });
        
        // Marcar todas como leídas
        this.btnMarcarTodas?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.markAllAsRead();
        });
        
        // Cerrar al hacer click fuera (pero no interferir con otros dropdowns)
        document.addEventListener('click', (e) => {
            // No cerrar si se hace click en elementos del dropdown de perfil
            const isProfileDropdown = e.target.closest('.user-dropdown') || 
                                     e.target.closest('.dropdown-perfil') ||
                                     e.target.closest('.menu-desplegable');
            
            if (this.isPanelOpen && 
                !this.notificationPanel?.contains(e.target) && 
                !this.notificationBtn?.contains(e.target) &&
                !isProfileDropdown) {
                this.closePanel();
            }
        });
        
        // Prevenir cierre al hacer click dentro del panel
        this.notificationPanel?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    togglePanel() {
        if (this.isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    openPanel() {
        this.notificationPanel?.classList.add('mostrar');
        this.isPanelOpen = true;
        this.loadNotifications(); // Recargar al abrir
    }
    
    closePanel() {
        this.notificationPanel?.classList.remove('mostrar');
        this.isPanelOpen = false;
    }
    
    async loadNotifications() {
        if (!this.notificationContent) return;
        
        try {
            const response = await fetch(`/api/notifications?page=${this.currentPage}&limit=${this.limit}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar notificaciones');
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                this.renderNotifications(data.data);
            } else {
                this.showEmpty();
            }
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            this.showError();
        }
    }
    
    renderNotifications(notifications) {
        if (!this.notificationContent) return;
        
        if (!notifications || notifications.length === 0) {
            this.showEmpty();
            return;
        }
        
        this.notificationContent.innerHTML = notifications.map(notif => this.createNotificationHTML(notif)).join('');
        
        // Agregar event listeners a cada notificación
        this.notificationContent.querySelectorAll('.notificacion-item').forEach((item, index) => {
            item.addEventListener('click', () => this.handleNotificationClick(notifications[index]));
        });
    }
    
    createNotificationHTML(notif) {
        const isUnread = notif.leido === 0;
        const iconClass = this.getIconClass(notif.tipo);
        const timeAgo = this.getTimeAgo(notif.created_at);
        const isUrgent = notif.prioridad === 3 || notif.color === 'rojo';
        
        // Usar las clases CSS existentes del proyecto
        return `
            <div class="notificacion-item ${isUnread ? 'no-leida' : ''} ${isUrgent ? 'urgente' : ''}" 
                 data-id="${notif.id_notificacion}" 
                 data-prioridad="${notif.prioridad}"
                 style="cursor: pointer; ${isUnread && !isUrgent ? 'background-color: #eff6ff;' : ''}">
                <span class="material-symbols-outlined">${iconClass}</span>
                <div>
                    <p style="font-weight: ${isUnread ? '600' : '400'}; color: var(--text-primary); margin-bottom: 4px;">
                        ${isUrgent ? '🚨 ' : ''}${this.escapeHtml(notif.titulo)}
                    </p>
                    <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 4px;">${this.escapeHtml(notif.mensaje)}</p>
                    <p class="tiempo">${timeAgo}</p>
                </div>
            </div>
        `;
    }
    
    getIconClass(tipo) {
        const iconMap = {
            'cambio_estado': 'update',
            'nuevo_comentario': 'comment',
            'modificacion': 'edit_note',
            'nuevo_reporte': 'add_circle',
            'asignacion': 'assignment_ind',
            'mencion': 'alternate_email',
            'sistema': 'info'
        };
        return iconMap[tipo] || 'notifications';
    }
    
    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
    
    async handleNotificationClick(notif) {
        // Marcar como leída si no lo está
        if (notif.leido === 0) {
            await this.markAsRead(notif.id_notificacion);
        }
        
        // Cerrar el panel
        this.closePanel();
        
        // Redirigir si hay enlace
        if (notif.enlace) {
            // Si es una ruta SPA, usar navegación SPA
            if (notif.enlace.startsWith('/') || notif.enlace.startsWith('detalle-reporte') || notif.enlace.startsWith('mis-reportes')) {
                window.location.href = notif.enlace;
            } else {
                window.open(notif.enlace, '_blank');
            }
        }
    }
    
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                // Actualizar UI
                const item = this.notificationContent?.querySelector(`[data-id="${notificationId}"]`);
                if (item) {
                    item.classList.remove('no-leida');
                    item.style.backgroundColor = '';
                    // Actualizar peso de fuente
                    const titleP = item.querySelector('p');
                    if (titleP) titleP.style.fontWeight = '400';
                }
                
                // Actualizar badge
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
        }
    }
    
    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PUT'
            });
            
            if (response.ok) {
                // Actualizar UI - remover clase no-leida de todas
                this.notificationContent?.querySelectorAll('.notificacion-item.no-leida').forEach(item => {
                    item.classList.remove('no-leida');
                    item.style.backgroundColor = '';
                    const titleP = item.querySelector('p');
                    if (titleP) titleP.style.fontWeight = '400';
                });
                
                // Actualizar badge
                this.updateBadge();
            }
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    }
    
    async updateBadge() {
        if (!this.notificationBadge) return;
        
        try {
            const response = await fetch('/api/notifications/count');
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.success && typeof data.data.count !== 'undefined') {
                const count = data.data.count;
                const previousCount = this.lastNotificationCount;
                
                if (count > 0) {
                    this.notificationBadge.textContent = count > 99 ? '99+' : count;
                    this.notificationBadge.style.display = 'block';
                    
                    // Verificar si hay notificaciones urgentes
                    await this.checkUrgentNotifications();
                    
                    // Si hay nuevas notificaciones (en tiempo real), animar y recargar
                    if (count > previousCount && previousCount > 0) {
                        this.animateNewNotification();
                        
                        // Si el panel está cerrado, mostrar alerta visual
                        if (!this.isPanelOpen) {
                            this.showNewNotificationAlert();
                        } else {
                            // Si está abierto, recargar automáticamente
                            this.loadNotifications();
                        }
                    }
                    
                    this.lastNotificationCount = count;
                } else {
                    this.notificationBadge.style.display = 'none';
                    this.hasUrgentNotifications = false;
                    this.notificationBadge.classList.remove('urgente');
                    this.lastNotificationCount = 0;
                }
            }
        } catch (error) {
            console.error('Error actualizando badge:', error);
        }
    }
    
    async checkUrgentNotifications() {
        try {
            const response = await fetch('/api/notifications?page=1&limit=5');
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.success && data.data) {
                // Verificar si hay alguna notificación urgente no leída
                const hasUrgent = data.data.some(notif => 
                    (notif.prioridad === 3 || notif.color === 'rojo') && notif.leido === 0
                );
                
                if (hasUrgent && !this.hasUrgentNotifications) {
                    this.notificationBadge.classList.add('urgente');
                    this.hasUrgentNotifications = true;
                    
                    // Reproducir sonido de notificación (opcional)
                    this.playNotificationSound();
                } else if (!hasUrgent && this.hasUrgentNotifications) {
                    this.notificationBadge.classList.remove('urgente');
                    this.hasUrgentNotifications = false;
                }
            }
        } catch (error) {
            console.error('Error verificando notificaciones urgentes:', error);
        }
    }
    
    animateNewNotification() {
        // Animar el botón de notificaciones
        this.notificationBtn?.classList.add('shake');
        setTimeout(() => {
            this.notificationBtn?.classList.remove('shake');
        }, 500);
    }
    
    showNewNotificationAlert() {
        // Mostrar toast de nueva notificación
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Tienes nuevas notificaciones', 'info');
        }
    }
    
    playNotificationSound() {
        // Reproducir sonido de notificación (opcional)
        // Puedes agregar un audio si lo deseas
        try {
            // const audio = new Audio('/sounds/notification.mp3');
            // audio.play();
        } catch (error) {
            console.log('No se pudo reproducir el sonido de notificación');
        }
    }
    
    showEmpty() {
        if (!this.notificationContent) return;
        
        this.notificationContent.innerHTML = `
            <div class="notificacion-item" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">notifications_off</span>
                <p style="margin-top: 12px;">No tienes notificaciones</p>
            </div>
        `;
    }
    
    showError() {
        if (!this.notificationContent) return;
        
        this.notificationContent.innerHTML = `
            <div class="notificacion-item" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">error_outline</span>
                <p style="margin-top: 12px;">Error al cargar notificaciones</p>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    startAutoRefresh() {
        // Actualizar cada 5 segundos para notificaciones en tiempo real
        this.refreshInterval = setInterval(() => {
            this.updateBadge();
            
            // Si el panel está abierto, recargar notificaciones
            if (this.isPanelOpen) {
                this.loadNotifications();
            }
        }, 5000); // 5 segundos para tiempo real
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    destroy() {
        this.stopAutoRefresh();
    }
}

// Inicializar el gestor de notificaciones globalmente
window.notificationManager = new NotificationManager();

// Exportar para uso en módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
