import notificationModel from '../models/notificationModel.js';

const notificationController = {
  // Obtener todas las notificaciones del usuario
  async getNotifications(req, res) {
    try {
      const userId = req.session.user.id_usuario || req.session.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const notifications = await notificationModel.getByUserId(userId, limit, offset);

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length
        }
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones'
      });
    }
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications(req, res) {
    try {
      console.log('📬 GET /api/notifications/unread');
      console.log('👤 Usuario en sesión:', req.session.user);
      
      if (!req.session.user || (!req.session.user.id_usuario && !req.session.user.id)) {
        console.error('❌ No hay usuario en sesión');
        return res.status(401).json({
          success: false,
          message: 'No hay sesión activa'
        });
      }
      
      // Soportar tanto id_usuario como id
      const userId = req.session.user.id_usuario || req.session.user.id;
      console.log(`🔍 Buscando notificaciones para usuario ID: ${userId}`);

      const notifications = await notificationModel.getUnreadByUserId(userId);
      const count = await notificationModel.countUnread(userId);

      console.log(`✅ Encontradas ${count} notificaciones no leídas`);
      console.log('📋 Notificaciones:', notifications);

      res.json({
        success: true,
        data: {
          notifications,
          count
        }
      });
    } catch (error) {
      console.error('❌ Error al obtener notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones no leídas'
      });
    }
  },

  // Obtener notificaciones urgentes
  async getUrgentNotifications(req, res) {
    try {
      if (!req.session.user || (!req.session.user.id_usuario && !req.session.user.id)) {
        return res.status(401).json({
          success: false,
          message: 'No hay sesión activa'
        });
      }
      
      const userId = req.session.user.id_usuario || req.session.user.id;
      const notifications = await notificationModel.getUrgentByUserId(userId);

      res.json({
        success: true,
        data: {
          notifications,
          count: notifications.length
        }
      });
    } catch (error) {
      console.error('❌ Error al obtener notificaciones urgentes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones urgentes'
      });
    }
  },

  // Contar notificaciones no leídas
  async getUnreadCount(req, res) {
    try {
      const userId = req.session.user.id_usuario || req.session.user.id;
      const count = await notificationModel.countUnread(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error al contar notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al contar notificaciones'
      });
    }
  },

  // Marcar notificación como leída
  async markAsRead(req, res) {
    try {
      const userId = req.session.user.id_usuario || req.session.user.id;
      const { id } = req.params;

      const success = await notificationModel.markAsRead(id, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notificación marcada como leída'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar notificación'
      });
    }
  },

  // Marcar todas como leídas
  async markAllAsRead(req, res) {
    try {
      const userId = req.session.user.id_usuario || req.session.user.id;
      const count = await notificationModel.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notificaciones marcadas como leídas`,
        data: { count }
      });
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar notificaciones'
      });
    }
  },

  // Eliminar notificación
  async deleteNotification(req, res) {
    try {
      const userId = req.session.user.id_usuario || req.session.user.id;
      const { id } = req.params;

      const success = await notificationModel.delete(id, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notificación eliminada'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar notificación'
      });
    }
  }
};

export default notificationController;
