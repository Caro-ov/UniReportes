import pool from '../config/db.js';

const notificationModel = {
  // Obtener notificaciones de un usuario
  async getByUserId(userId, limit = 20, offset = 0) {
    const safeLimit = parseInt(limit) || 20;
    const safeOffset = parseInt(offset) || 0;
    const [rows] = await pool.execute(
      `SELECT 
        n.*,
        r.titulo as reporte_titulo,
        r.id_estado,
        e.nombre as estado_nombre
      FROM notificaciones n
      INNER JOIN reportes r ON n.id_reporte = r.id_reporte
      LEFT JOIN estados e ON r.id_estado = e.id_estado
      WHERE n.id_usuario_destino = ? AND r.id_estado != 4
      ORDER BY n.fecha_creacion DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [userId]
    );
    return rows;
  },

  // Obtener notificaciones no leídas
  async getUnreadByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        n.*,
        r.titulo as reporte_titulo,
        r.id_estado,
        e.nombre as estado_nombre
      FROM notificaciones n
      INNER JOIN reportes r ON n.id_reporte = r.id_reporte
      LEFT JOIN estados e ON r.id_estado = e.id_estado
      WHERE n.id_usuario_destino = ? AND n.leida = 0 AND r.id_estado != 4
      ORDER BY n.prioridad DESC, n.fecha_creacion DESC`,
      [userId]
    );
    return rows;
  },

  // Obtener notificaciones urgentes (prioridad >= 2) no leídas y no resueltas
  async getUrgentByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        n.*,
        r.titulo as reporte_titulo,
        r.id_estado,
        r.id_categoria,
        e.nombre as estado_nombre,
        c.nombre as categoria_nombre,
        s.nombre as salon_nombre,
        ub.nombre as ubicacion_nombre
      FROM notificaciones n
      INNER JOIN reportes r ON n.id_reporte = r.id_reporte
      LEFT JOIN estados e ON r.id_estado = e.id_estado
      LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
      LEFT JOIN salones s ON r.id_salon = s.id_salon
      LEFT JOIN ubicaciones ub ON s.ubicacion = ub.id_ubicacion
      WHERE n.id_usuario_destino = ? 
        AND n.leida = 0 
        AND r.id_estado != 4
        AND (n.prioridad >= 2 OR r.id_categoria = 6)
      ORDER BY n.prioridad DESC, n.fecha_creacion DESC`,
      [userId]
    );
    return rows;
  },

  // Contar notificaciones no leídas
  async countUnread(userId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM notificaciones n
       INNER JOIN reportes r ON n.id_reporte = r.id_reporte
       WHERE n.id_usuario_destino = ? AND n.leida = 0 AND r.id_estado != 4`,
      [userId]
    );
    return rows[0].count;
  },

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    const [result] = await pool.execute(
      `UPDATE notificaciones 
       SET leida = 1 
       WHERE id_notificacion = ? AND id_usuario_destino = ?`,
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    const [result] = await pool.execute(
      `UPDATE notificaciones 
       SET leida = 1 
       WHERE id_usuario_destino = ? AND leida = 0`,
      [userId]
    );
    return result.affectedRows;
  },

  // Eliminar notificación
  async delete(notificationId, userId) {
    const [result] = await pool.execute(
      `DELETE FROM notificaciones 
       WHERE id_notificacion = ? AND id_usuario_destino = ?`,
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  },

  // Crear notificación manual (adicional a los triggers)
  async create(data) {
    const { id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad = 1, color = 'azul' } = data;
    const [result] = await pool.execute(
      `INSERT INTO notificaciones 
       (id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color]
    );
    return result.insertId;
  }
};

export default notificationModel;
