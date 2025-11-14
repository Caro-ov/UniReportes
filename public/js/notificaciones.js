// Sistema de gestión de notificaciones en tiempo real
class NotificationManager {
  constructor() {
    this.isPanelOpen = false;
    this.lastNotificationCount = 0;
    this.pollInterval = null;
    this.hasUrgentNotifications = false;
    this.browserNotificationsEnabled = false;
    
    // Solicitar permiso para notificaciones del navegador
    this.requestBrowserNotificationPermission();
  }

  // Solicitar permiso para notificaciones del navegador
  async requestBrowserNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        this.browserNotificationsEnabled = (permission === 'granted');
      } catch (error) {
        console.debug('Notificaciones del navegador no disponibles');
      }
    } else if (Notification.permission === 'granted') {
      this.browserNotificationsEnabled = true;
    }
  }

  // Mostrar notificación del navegador
  showBrowserNotification(notification) {
    if (!this.browserNotificationsEnabled || document.hasFocus()) {
      return; // No mostrar si la página está en foco
    }

    try {
      const options = {
        body: notification.mensaje,
        icon: '/img/logo-notification.png', // Asegúrate de tener este icono
        badge: '/img/badge-notification.png',
        tag: `notification-${notification.id_notificacion}`,
        requireInteraction: notification.prioridad === 3,
        data: {
          reportId: notification.id_reporte,
          notificationId: notification.id_notificacion
        }
      };

      const browserNotif = new Notification(notification.titulo, options);

      browserNotif.onclick = () => {
        window.focus();
        this.markAsRead(notification.id_notificacion);
        
        // Navegar al reporte
        const userRole = window.currentUserRole || 'monitor';
        const detailPage = userRole === 'admin' ? 'detalle-reporte-admin.html' : 'detalle-reporte.html';
        
        if (window.navigateToPage) {
          window.navigateToPage(detailPage, { id: notification.id_reporte });
        } else {
          window.location.href = `${detailPage}?id=${notification.id_reporte}`;
        }
        
        browserNotif.close();
      };

      // Auto cerrar después de 5 segundos (excepto urgentes)
      if (notification.prioridad !== 3) {
        setTimeout(() => browserNotif.close(), 5000);
      }
    } catch (error) {
      console.debug('Error al mostrar notificación del navegador:', error);
    }
  }

  // Inicializar el sistema de notificaciones
  init() {
    console.log('🔔 Inicializando NotificationManager...');
    console.log('📋 Verificando elementos del DOM...');
    
    // Verificar que existan los elementos necesarios
    const panel = $('.panel-notificaciones');
    const lista = $('.notificaciones-lista');
    const badge = $('.badge-count');
    const btn = $('.notification-btn');
    
    console.log('Panel encontrado:', panel.length > 0);
    console.log('Lista encontrada:', lista.length > 0);
    console.log('Badge encontrado:', badge.length > 0);
    console.log('Botón encontrado:', btn.length > 0);
    
    if (panel.length === 0) {
      console.error('❌ No se encontró .panel-notificaciones');
      return;
    }
    
    if (lista.length === 0) {
      console.error('❌ No se encontró .notificaciones-lista');
      return;
    }
    
    this.setupEventListeners();
    this.setupVisibilityChange();
    this.loadNotifications(); // Cargar inmediatamente
    this.startAutoRefresh(); // Luego iniciar actualización automática
    
    console.log('✅ NotificationManager inicializado correctamente');
  }

  // Detectar cuando el usuario vuelve a la pestaña
  setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Usuario volvió a la pestaña, actualizar inmediatamente
        this.loadNotifications();
      }
    });
  }

  // Configurar eventos
  setupEventListeners() {
    console.log('🎧 Configurando event listeners...');
    
    // Toggle panel de notificaciones
    $(document).on('click', '.notification-btn, .boton-notificaciones', (e) => {
      console.log('🔔 Click en botón de notificaciones');
      e.stopPropagation();
      this.togglePanel();
    });

    // Cerrar panel
    $(document).on('click', '.cerrar-panel', (e) => {
      e.stopPropagation();
      this.closePanel();
    });

    // Marcar todas como leídas
    $(document).on('click', '.btn-marcar-leidas', () => {
      this.markAllAsRead();
    });

    // Click en notificación individual
    $(document).on('click', '.notificacion-item', (e) => {
      const notificationId = $(e.currentTarget).data('id');
      const reportId = $(e.currentTarget).data('report-id');
      
      if (notificationId) {
        this.markAsRead(notificationId);
      }
      
      if (reportId) {
        // Navegar al reporte
        const userRole = window.currentUserRole || 'monitor';
        const detailPage = userRole === 'admin' ? 'detalle-reporte-admin.html' : 'detalle-reporte.html';
        
        this.closePanel();
        
        // Usar SPA navigation si está disponible
        if (window.navigateToPage) {
          window.navigateToPage(detailPage, { id: reportId });
        } else {
          window.location.href = `${detailPage}?id=${reportId}`;
        }
      }
    });

    // Cerrar panel al hacer click fuera
    $(document).on('click', (e) => {
      if (this.isPanelOpen && !$(e.target).closest('.panel-notificaciones, .notification-btn').length) {
        this.closePanel();
      }
    });

    // Cerrar dropdown de perfil al abrir notificaciones
    $(document).on('click', '.notification-btn', () => {
      $('.user-dropdown, .dropdown-perfil').removeClass('open');
      $('.menu-desplegable').removeClass('mostrar');
    });
  }

  // Toggle panel
  togglePanel() {
    if (this.isPanelOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  // Abrir panel
  openPanel() {
    console.log('📂 Abriendo panel de notificaciones');
    const panel = $('.panel-notificaciones');
    console.log('Panel encontrado:', panel.length > 0);
    
    panel.addClass('mostrar');
    this.isPanelOpen = true;
    this.loadNotifications(); // Recargar al abrir
    
    console.log('Panel abierto, clases:', panel.attr('class'));
  }

  // Cerrar panel
  closePanel() {
    console.log('📁 Cerrando panel de notificaciones');
    $('.panel-notificaciones').removeClass('mostrar');
    this.isPanelOpen = false;
  }

  // Cargar notificaciones
  async loadNotifications() {
    try {
      console.log('📡 Cargando notificaciones...');
      
      // Cargar las últimas 10 notificaciones (leídas y no leídas)
      const [allResponse, unreadResponse] = await Promise.all([
        $.get('/api/notifications?limit=10'),
        $.get('/api/notifications/unread')
      ]);
      
      console.log('📥 Respuesta recibida - Todas:', allResponse, 'No leídas:', unreadResponse);
      
      if (allResponse.success && unreadResponse.success) {
        const allNotifications = allResponse.data.notifications || [];
        const unreadCount = unreadResponse.data.count || 0;
        const unreadNotifications = unreadResponse.data.notifications || [];
        
        console.log(`✅ ${allNotifications.length} notificaciones totales, ${unreadCount} no leídas`);
        console.log('📋 Notificaciones:', allNotifications);
        
        // Detectar nuevas notificaciones ANTES de actualizar
        const hasNewNotifications = unreadCount > this.lastNotificationCount && this.lastNotificationCount > 0;
        
        this.updateBadge(unreadCount);
        this.renderNotifications(allNotifications); // Renderizar TODAS las notificaciones
        this.checkUrgentNotifications(unreadNotifications);
        
        // Animar si hay nuevas notificaciones
        if (hasNewNotifications) {
          this.animateNewNotification();
          
          // Reproducir sonido de notificación si está disponible
          this.playNotificationSound();
          
          // Encontrar la notificación más reciente NO LEÍDA
          const newestNotification = unreadNotifications.reduce((newest, current) => {
            return new Date(current.fecha_creacion) > new Date(newest.fecha_creacion) ? current : newest;
          }, unreadNotifications[0]);
          
          // Mostrar notificación del navegador para la más reciente
          if (newestNotification) {
            this.showBrowserNotification(newestNotification);
          }
          
          // Mostrar toast para notificaciones urgentes
          const newUrgent = unreadNotifications.find(n => 
            (n.prioridad === 3 || n.color === 'rojo') && 
            new Date(n.fecha_creacion) > new Date(Date.now() - 10000) // Últimos 10 seg
          );
          
          if (newUrgent && window.mostrarToast) {
            window.mostrarToast(`🚨 ${newUrgent.titulo}`, 'error');
          }
        }
        
        this.lastNotificationCount = unreadCount;
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  }

  // Actualizar badge de contador
  updateBadge(count) {
    const badge = $('.badge-count');
    const btn = $('.notification-btn');
    
    if (count > 0) {
      badge.text(count > 99 ? '99+' : count);
      badge.show();
      
      if (this.hasUrgentNotifications) {
        badge.addClass('urgente');
        btn.addClass('tiene-urgentes');
      } else {
        badge.removeClass('urgente');
        btn.removeClass('tiene-urgentes');
      }
    } else {
      badge.hide();
      badge.removeClass('urgente');
      btn.removeClass('tiene-urgentes');
    }
  }

  // Renderizar notificaciones en el panel
  renderNotifications(notifications) {
    console.log('🎨 Renderizando notificaciones en el panel:', notifications);
    const container = $('.notificaciones-lista');
    
    if (!container.length) {
      console.error('❌ No se encontró .notificaciones-lista');
      return;
    }
    
    if (notifications.length === 0) {
      console.log('📭 No hay notificaciones para mostrar');
      container.html(`
        <div class="notificacion-vacia">
          <span class="material-symbols-outlined">notifications_off</span>
          <p>No tienes notificaciones</p>
        </div>
      `);
      return;
    }

    console.log(`📝 Renderizando ${notifications.length} notificaciones`);
    const html = notifications.map(notif => {
      const icono = this.getIconoTipo(notif.tipo);
      const tiempo = this.formatearTiempo(notif.fecha_creacion);
      const clases = ['notificacion-item'];
      
      if (!notif.leida) clases.push('no-leida');
      if (notif.prioridad === 3 || notif.color === 'rojo') clases.push('urgente');

      return `
        <div class="${clases.join(' ')}" data-id="${notif.id_notificacion}" data-report-id="${notif.id_reporte}">
          <div class="notificacion-icono ${notif.color}">
            <span class="material-symbols-outlined">${icono}</span>
          </div>
          <div class="notificacion-contenido">
            <p class="notificacion-titulo">${this.escapeHtml(notif.titulo)}</p>
            <p class="notificacion-mensaje">${this.escapeHtml(notif.mensaje)}</p>
            <p class="notificacion-tiempo">${tiempo}</p>
          </div>
        </div>
      `;
    }).join('');

    container.html(html);
  }

  // Verificar si hay notificaciones urgentes
  checkUrgentNotifications(notifications) {
    this.hasUrgentNotifications = notifications.some(
      n => n.prioridad === 3 || n.color === 'rojo'
    );
  }

  // Animar nueva notificación
  animateNewNotification() {
    const btn = $('.notification-btn');
    btn.addClass('nueva-notificacion');
    setTimeout(() => btn.removeClass('nueva-notificacion'), 500);
  }

  // Reproducir sonido de notificación (opcional)
  playNotificationSound() {
    try {
      // Crear un tono simple usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silenciar errores de audio
      console.debug('Audio no disponible');
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      await $.ajax({
        url: `/api/notifications/${notificationId}/read`,
        method: 'PUT'
      });
      
      this.loadNotifications(); // Recargar lista
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  // Marcar todas como leídas
  async markAllAsRead() {
    try {
      const response = await $.ajax({
        url: '/api/notifications/read-all',
        method: 'PUT'
      });
      
      if (response.success) {
        this.loadNotifications();
        if (window.mostrarToast) {
          window.mostrarToast('Todas las notificaciones marcadas como leídas', 'success');
        }
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      if (window.mostrarToast) {
        window.mostrarToast('Error al actualizar notificaciones', 'error');
      }
    }
  }

  // Iniciar actualización automática
  startAutoRefresh() {
    // Actualizar cada 3 segundos para tiempo real
    this.pollInterval = setInterval(() => {
      this.loadNotifications();
    }, 3000);
  }

  // Detener actualización automática
  stopAutoRefresh() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Obtener icono según tipo de notificación
  getIconoTipo(tipo) {
    const iconos = {
      'cambio_estado': 'swap_horiz',
      'comentario': 'comment',
      'edicion': 'edit',
      'nuevo_reporte': 'add_circle',
      'archivo': 'attach_file'
    };
    return iconos[tipo] || 'notifications';
  }

  // Formatear tiempo relativo
  formatearTiempo(fecha) {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diff = ahora - notifFecha;
    
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (segundos < 60) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    
    return notifFecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  }

  // Escapar HTML para prevenir XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Destruir instancia
  destroy() {
    this.stopAutoRefresh();
    $(document).off('click.notifications');
  }
}

// Exportar para uso global
window.NotificationManager = NotificationManager;
