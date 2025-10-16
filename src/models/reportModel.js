import pool from '../config/db.js';

/**
 * Crear un nuevo reporte
 */
export async function createReport(reportData) {
    const {
        titulo,
        descripcion,
        ubicacion,
        categoria_id,
        usuario_id,
        prioridad = 'media'
    } = reportData;

    const [result] = await pool.execute(
        `INSERT INTO reportes (titulo, descripcion, ubicacion, categoria_id, usuario_id, prioridad) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, descripcion, ubicacion, categoria_id, usuario_id, prioridad]
    );

    return result.insertId;
}

/**
 * Obtener todos los reportes con información de usuario y categoría
 */
export async function getAllReports(limit = 50, offset = 0) {
    const [rows] = await pool.execute(
        `SELECT 
            r.*,
            u.nombre as usuario_nombre,
            u.correo as usuario_correo,
            c.nombre as categoria_nombre,
            c.color as categoria_color
         FROM reportes r
         LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
         LEFT JOIN categorias c ON r.categoria_id = c.id_categoria
         ORDER BY r.fecha_creacion DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    return rows;
}

/**
 * Obtener reportes por usuario
 */
export async function getReportsByUser(userId, limit = 50, offset = 0) {
    const [rows] = await pool.execute(
        `SELECT 
            r.*,
            u.nombre as usuario_nombre,
            c.nombre as categoria_nombre,
            c.color as categoria_color
         FROM reportes r
         LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
         LEFT JOIN categorias c ON r.categoria_id = c.id_categoria
         WHERE r.usuario_id = ?
         ORDER BY r.fecha_creacion DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    return rows;
}

/**
 * Obtener un reporte por ID con toda la información relacionada
 */
export async function getReportById(reportId) {
    const [rows] = await pool.execute(
        `SELECT 
            r.*,
            u.nombre as usuario_nombre,
            u.correo as usuario_correo,
            c.nombre as categoria_nombre,
            c.color as categoria_color,
            c.descripcion as categoria_descripcion
         FROM reportes r
         LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
         LEFT JOIN categorias c ON r.categoria_id = c.id_categoria
         WHERE r.id_reporte = ?`,
        [reportId]
    );
    return rows[0] || null;
}

/**
 * Actualizar estado de un reporte
 */
export async function updateReportStatus(reportId, newStatus) {
    const [result] = await pool.execute(
        'UPDATE reportes SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_reporte = ?',
        [newStatus, reportId]
    );
    return result.affectedRows > 0;
}

/**
 * Actualizar un reporte completo
 */
export async function updateReport(reportId, updateData) {
    const fields = [];
    const values = [];

    // Construir query dinámicamente
    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });

    if (fields.length === 0) {
        return false;
    }

    fields.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    values.push(reportId);

    const [result] = await pool.execute(
        `UPDATE reportes SET ${fields.join(', ')} WHERE id_reporte = ?`,
        values
    );

    return result.affectedRows > 0;
}

/**
 * Eliminar un reporte
 */
export async function deleteReport(reportId) {
    const [result] = await pool.execute(
        'DELETE FROM reportes WHERE id_reporte = ?',
        [reportId]
    );
    return result.affectedRows > 0;
}

/**
 * Obtener reportes por filtros
 */
export async function getReportsFiltered(filters = {}) {
    let query = `
        SELECT 
            r.*,
            u.nombre as usuario_nombre,
            c.nombre as categoria_nombre,
            c.color as categoria_color
        FROM reportes r
        LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
        LEFT JOIN categorias c ON r.categoria_id = c.id_categoria
        WHERE 1=1
    `;
    
    const values = [];

    if (filters.estado) {
        query += ' AND r.estado = ?';
        values.push(filters.estado);
    }

    if (filters.categoria_id) {
        query += ' AND r.categoria_id = ?';
        values.push(filters.categoria_id);
    }

    if (filters.prioridad) {
        query += ' AND r.prioridad = ?';
        values.push(filters.prioridad);
    }

    if (filters.fecha_desde) {
        query += ' AND r.fecha_creacion >= ?';
        values.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
        query += ' AND r.fecha_creacion <= ?';
        values.push(filters.fecha_hasta);
    }

    if (filters.buscar) {
        query += ' AND (r.titulo LIKE ? OR r.descripcion LIKE ? OR r.ubicacion LIKE ?)';
        const searchTerm = `%${filters.buscar}%`;
        values.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY r.fecha_creacion DESC';

    if (filters.limit) {
        query += ' LIMIT ?';
        values.push(parseInt(filters.limit));
    }

    const [rows] = await pool.execute(query, values);
    return rows;
}

/**
 * Obtener estadísticas de reportes
 */
export async function getReportsStats() {
    const [stats] = await pool.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
            SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
            SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
            SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as alta_prioridad,
            SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 ELSE 0 END) as hoy,
            SUM(CASE WHEN WEEK(fecha_creacion, 1) = WEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as esta_semana
        FROM reportes
    `);
    
    return stats[0] || {};
}

export default {
    createReport,
    getAllReports,
    getReportsByUser,
    getReportById,
    updateReportStatus,
    updateReport,
    deleteReport,
    getReportsFiltered,
    getReportsStats
};
