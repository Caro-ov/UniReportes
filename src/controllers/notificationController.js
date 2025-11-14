import * as notificationModel from '../models/notificationModel.js';

/**
 * Obtener notificaciones del usuario actual
 */
export async function getNotifications(req, res) {
    try {
        const userId = req.session.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const notifications = await notificationModel.getUserNotifications(userId, limit, offset);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                hasMore: notifications.length === limit
            }
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getUnreadCount(req, res) {
    try {
        const userId = req.session.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const count = await notificationModel.getUnreadCount(userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error al obtener contador:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Marcar notificación como leída
 */
export async function markAsRead(req, res) {
    try {
        const userId = req.session.user?.id;
        const notificationId = parseInt(req.params.id);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'ID de notificación inválido'
            });
        }

        const success = await notificationModel.markAsRead(notificationId, userId);

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
        console.error('Error al marcar como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead(req, res) {
    try {
        const userId = req.session.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const count = await notificationModel.markAllAsRead(userId);

        res.json({
            success: true,
            message: `${count} notificación(es) marcada(s) como leída(s)`,
            data: { count }
        });
    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Archivar una notificación
 */
export async function archiveNotification(req, res) {
    try {
        const userId = req.session.user?.id;
        const notificationId = parseInt(req.params.id);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'ID de notificación inválido'
            });
        }

        const success = await notificationModel.archiveNotification(notificationId, userId);

        if (success) {
            res.json({
                success: true,
                message: 'Notificación archivada'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }
    } catch (error) {
        console.error('Error al archivar notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas de notificaciones
 */
export async function getStats(req, res) {
    try {
        const userId = req.session.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const stats = await notificationModel.getNotificationStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    getStats
};
