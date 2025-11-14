import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

/**
 * Rutas de notificaciones
 * Base: /api/notifications
 */

// GET /api/notifications - Obtener notificaciones del usuario
router.get('/', notificationController.getNotifications);

// GET /api/notifications/count - Obtener contador de no leídas
router.get('/count', notificationController.getUnreadCount);

// GET /api/notifications/stats - Obtener estadísticas
router.get('/stats', notificationController.getStats);

// PUT /api/notifications/:id/read - Marcar como leída
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/read-all - Marcar todas como leídas
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Archivar notificación
router.delete('/:id', notificationController.archiveNotification);

export default router;
