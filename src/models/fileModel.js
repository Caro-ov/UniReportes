import pool from '../config/db.js';

/**
 * Insertar un nuevo archivo en la base de datos
 */
export async function createFile(fileData) {
    const {
        id_reporte,
        url,
        tipo
    } = fileData;

    const [result] = await pool.execute(
        `INSERT INTO archivos (id_reporte, url, tipo, fecha_subida) 
         VALUES (?, ?, ?, NOW())`,
        [id_reporte, url, tipo]
    );

    return result.insertId;
}

/**
 * Obtener todos los archivos de un reporte específico
 */
export async function getFilesByReportId(reportId) {
    const [rows] = await pool.execute(
        `SELECT 
            id_archivo,
            id_reporte,
            url,
            tipo,
            fecha_subida
         FROM archivos 
         WHERE id_reporte = ?
         ORDER BY fecha_subida ASC`,
        [reportId]
    );

    return rows;
}

/**
 * Obtener un archivo específico por su ID
 */
export async function getFileById(fileId) {
    const [rows] = await pool.execute(
        `SELECT 
            a.*,
            r.id_usuario
         FROM archivos a
         JOIN reportes r ON a.id_reporte = r.id_reporte
         WHERE a.id_archivo = ?`,
        [fileId]
    );

    return rows[0] || null;
}

/**
 * Eliminar un archivo de la base de datos
 */
export async function deleteFile(fileId) {
    const [result] = await pool.execute(
        'DELETE FROM archivos WHERE id_archivo = ?',
        [fileId]
    );

    return result.affectedRows > 0;
}

/**
 * Eliminar todos los archivos de un reporte
 */
export async function deleteFilesByReportId(reportId) {
    const [result] = await pool.execute(
        'DELETE FROM archivos WHERE id_reporte = ?',
        [reportId]
    );

    return result.affectedRows;
}

/**
 * Verificar si un archivo pertenece a un usuario específico
 */
export async function isFileOwnedByUser(fileId, userId) {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM archivos a
         JOIN reportes r ON a.id_reporte = r.id_reporte
         WHERE a.id_archivo = ? AND r.id_usuario = ?`,
        [fileId, userId]
    );

    return rows[0].count > 0;
}

/**
 * Obtener estadísticas de archivos
 */
export async function getFilesStats() {
    const [rows] = await pool.execute(
        `SELECT 
            COUNT(*) as total_archivos,
            COUNT(CASE WHEN tipo LIKE 'image/%' THEN 1 END) as total_imagenes,
            COUNT(CASE WHEN tipo LIKE 'video/%' THEN 1 END) as total_videos
         FROM archivos`
    );

    return rows[0];
}

export default {
    createFile,
    getFilesByReportId,
    getFileById,
    deleteFile,
    deleteFilesByReportId,
    isFileOwnedByUser,
    getFilesStats
};