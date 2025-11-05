import pool from '../config/db.js';

/**
 * Crear un nuevo reporte
 */
export async function createReport(reportData) {
    const {
        titulo,
        descripcion,
        id_salon,
        id_categoria,
        id_usuario,
        id_objeto = null
    } = reportData;

    const [result] = await pool.execute(
        `INSERT INTO reportes (titulo, descripcion, id_salon, id_categoria, id_usuario, id_objeto, fecha_reporte) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [titulo, descripcion, id_salon, id_categoria, id_usuario, id_objeto]
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
            s.nombre as salon_nombre,
            ub.nombre as ubicacion_nombre
         FROM reportes r
         LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
         LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
         LEFT JOIN salones s ON r.id_salon = s.id_salon
         LEFT JOIN ubicaciones ub ON s.ubicacion = ub.id_ubicacion
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
            c.nombre as categoria_nombre
         FROM reportes r
         LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
         LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
         WHERE r.id_usuario = ?
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
            c.descripcion as categoria_descripcion
         FROM reportes r
         LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
         LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
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
        'UPDATE reportes SET estado = ? WHERE id_reporte = ?',
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
            c.nombre as categoria_nombre
        FROM reportes r
        LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
        LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
        WHERE 1=1
    `;
    
    const values = [];

    if (filters.estado) {
        query += ' AND r.estado = ?';
        values.push(filters.estado);
    }

    if (filters.id_categoria) {
        query += ' AND r.id_categoria = ?';
        values.push(filters.id_categoria);
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
