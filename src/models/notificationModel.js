import pool from '../config/db.js';

/**
 * Modelo para gestionar notificaciones
 */

/**
 * Obtener notificaciones de un usuario
 */
export async function getUserNotifications(userId, limit = 20, offset = 0) {
    const [rows] = await pool.execute(
        `SELECT 
            n.id_notificacion,
            n.tipo,
            n.titulo,
            n.mensaje,
            n.enlace,
            n.prioridad,
            n.icono,
            n.color,
            n.id_reporte,
            n.id_comentario,
            nu.leido,
            nu.leido_at,
            nu.archivado,
            n.created_at,
            u.nombre AS actor_nombre,
            u.correo AS actor_correo
        FROM notificaciones_usuarios nu
        INNER JOIN notificaciones n ON nu.id_notificacion = n.id_notificacion
        LEFT JOIN usuarios u ON n.id_usuario_actor = u.id_usuario
        WHERE nu.id_usuario = ? 
          AND nu.archivado = 0
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    
    return rows;
}

/**
 * Contar notificaciones no leídas de un usuario
 */
export async function getUnreadCount(userId) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) as count
        FROM notificaciones_usuarios nu
        INNER JOIN notificaciones n ON nu.id_notificacion = n.id_notificacion
        WHERE nu.id_usuario = ? 
          AND nu.leido = 0 
          AND nu.archivado = 0`,
        [userId]
    );
    
    return rows[0].count;
}

/**
 * Marcar una notificación como leída
 */
export async function markAsRead(notificationId, userId) {
    const [result] = await pool.execute(
        `UPDATE notificaciones_usuarios 
        SET leido = 1, leido_at = NOW()
        WHERE id_notificacion = ? AND id_usuario = ?`,
        [notificationId, userId]
    );
    
    return result.affectedRows > 0;
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead(userId) {
    const [result] = await pool.execute(
        `UPDATE notificaciones_usuarios 
        SET leido = 1, leido_at = NOW()
        WHERE id_usuario = ? AND leido = 0`,
        [userId]
    );
    
    return result.affectedRows;
}

/**
 * Archivar una notificación
 */
export async function archiveNotification(notificationId, userId) {
    const [result] = await pool.execute(
        `UPDATE notificaciones_usuarios 
        SET archivado = 1
        WHERE id_notificacion = ? AND id_usuario = ?`,
        [notificationId, userId]
    );
    
    return result.affectedRows > 0;
}

/**
 * Crear notificación manual (opcional, los triggers ya lo hacen automáticamente)
 */
export async function createNotification(notificationData) {
    const {
        tipo,
        titulo,
        mensaje,
        enlace = null,
        prioridad = 2,
        icono = 'fa-bell',
        color = 'primary',
        id_reporte = null,
        id_comentario = null,
        id_usuario_actor = null,
        metadata = null,
        destinatarios = [] // Array de user IDs
    } = notificationData;

    // Insertar notificación
    const [result] = await pool.execute(
        `INSERT INTO notificaciones (
            tipo, titulo, mensaje, enlace, prioridad, icono, color,
            id_reporte, id_comentario, id_usuario_actor, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tipo, titulo, mensaje, enlace, prioridad, icono, color,
            id_reporte, id_comentario, id_usuario_actor,
            metadata ? JSON.stringify(metadata) : null
        ]
    );

    const notificationId = result.insertId;

    // Asignar a destinatarios
    if (destinatarios.length > 0) {
        const values = destinatarios.map(userId => [notificationId, userId]);
        await pool.query(
            'INSERT INTO notificaciones_usuarios (id_notificacion, id_usuario) VALUES ?',
            [values]
        );
    }

    return notificationId;
}

/**
 * Obtener estadísticas de notificaciones
 */
export async function getNotificationStats(userId) {
    const [rows] = await pool.execute(
        `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN nu.leido = 0 THEN 1 ELSE 0 END) as no_leidas,
            SUM(CASE WHEN nu.leido = 1 THEN 1 ELSE 0 END) as leidas,
            SUM(CASE WHEN DATE(n.created_at) = CURDATE() THEN 1 ELSE 0 END) as hoy
        FROM notificaciones_usuarios nu
        INNER JOIN notificaciones n ON nu.id_notificacion = n.id_notificacion
        WHERE nu.id_usuario = ? AND nu.archivado = 0`,
        [userId]
    );
    
    return rows[0];
}

export default {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    createNotification,
    getNotificationStats
};
