import pool from '../config/db.js';

/**
 * Obtener historial de cambios de un reporte
 */
export async function getHistorialByReportId(reportId) {
    const [rows] = await pool.execute(
        `SELECT 
            h.*,
            u_actor.nombre as usuario_actor_nombre,
            u_asignado.nombre as usuario_asignado_nombre,
            d.nombre as dependencia_nombre,
            e_anterior.nombre as estado_anterior_nombre,
            e_nuevo.nombre as estado_nuevo_nombre
         FROM historial_cambios h
         LEFT JOIN usuarios u_actor ON h.id_usuario_actor = u_actor.id_usuario
         LEFT JOIN usuarios u_asignado ON h.id_usuario_asignado = u_asignado.id_usuario
         LEFT JOIN dependencias d ON h.id_dependencia_asignada = d.id_dependencia
         LEFT JOIN estados e_anterior ON h.id_estado_anterior = e_anterior.id_estado
         LEFT JOIN estados e_nuevo ON h.id_estado_nuevo = e_nuevo.id_estado
         WHERE h.id_reporte = ?
         ORDER BY h.fecha ASC`,
        [reportId]
    );
    
    return rows;
}

/**
 * Crear entrada en el historial de cambios
 */
export async function createHistorialEntry(historialData) {
    const {
        id_reporte,
        tipo,
        id_estado_anterior = null,
        id_estado_nuevo = null,
        id_usuario_actor = null,
        id_usuario_asignado = null,
        id_dependencia_asignada = null,
        descripcion = null,
        campo = null,
        valor_anterior = null,
        valor_nuevo = null,
        cambios_json = null
    } = historialData;

    const [result] = await pool.execute(
        `INSERT INTO historial_cambios (
            id_reporte, tipo, id_estado_anterior, id_estado_nuevo,
            id_usuario_actor, id_usuario_asignado, id_dependencia_asignada,
            descripcion, campo, valor_anterior, valor_nuevo, cambios_json, fecha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
            id_reporte, tipo, id_estado_anterior, id_estado_nuevo,
            id_usuario_actor, id_usuario_asignado, id_dependencia_asignada,
            descripcion, campo, valor_anterior, valor_nuevo, cambios_json
        ]
    );

    return result.insertId;
}

/**
 * Obtener estadísticas del historial
 */
export async function getHistorialStats() {
    const [rows] = await pool.execute(
        `SELECT 
            COUNT(*) as total_eventos,
            COUNT(CASE WHEN tipo = 'cambio_estado' THEN 1 END) as cambios_estado,
            COUNT(CASE WHEN tipo = 'asignacion' THEN 1 END) as asignaciones,
            COUNT(CASE WHEN tipo = 'comentario' THEN 1 END) as comentarios
         FROM historial_cambios`
    );

    return rows[0];
}

export default {
    getHistorialByReportId,
    createHistorialEntry,
    getHistorialStats
};