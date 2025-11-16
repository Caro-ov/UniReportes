import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Obtener todas las notificaciones del usuario
router.get('/', notificationController.getNotifications);

// Obtener notificaciones no leídas
router.get('/unread', notificationController.getUnreadNotifications);

// Obtener notificaciones urgentes (prioridad >= 2 o categoría urgente)
router.get('/urgent', notificationController.getUrgentNotifications);

// Contar notificaciones no leídas
router.get('/unread/count', notificationController.getUnreadCount);

// Marcar notificación como leída
router.put('/:id/read', notificationController.markAsRead);

// Marcar todas como leídas
router.put('/read-all', notificationController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', notificationController.deleteNotification);

export default router;
