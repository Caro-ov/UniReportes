import pool from '../config/db.js';

/**
 * Obtener todos los objetos
 */
export async function getAllObjects() {
    const [rows] = await pool.execute(
        'SELECT * FROM objetos ORDER BY nombre ASC'
    );
    return rows;
}

/**
 * Obtener objetos por categoría
 */
export async function getObjectsByCategory(categoryId) {
    const [rows] = await pool.execute(
        'SELECT * FROM objetos WHERE id_categoria = ? ORDER BY nombre ASC',
        [categoryId]
    );
    return rows;
}

/**
 * Obtener un objeto por ID
 */
export async function getObjectById(objectId) {
    const [rows] = await pool.execute(
        'SELECT * FROM objetos WHERE id_objeto = ?',
        [objectId]
    );
    return rows[0] || null;
}

/**
 * Crear un nuevo objeto
 */
export async function createObject(objectData) {
    const { nombre, especificaciones, id_categoria } = objectData;
    
    const [result] = await pool.execute(
        'INSERT INTO objetos (nombre, especificaciones, id_categoria) VALUES (?, ?, ?)',
        [nombre, especificaciones, id_categoria]
    );
    
    return result.insertId;
}

/**
 * Actualizar un objeto
 */
export async function updateObject(objectId, updateData) {
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

    values.push(objectId);

    const [result] = await pool.execute(
        `UPDATE objetos SET ${fields.join(', ')} WHERE id_objeto = ?`,
        values
    );

    return result.affectedRows > 0;
}

/**
 * Eliminar un objeto
 */
export async function deleteObject(objectId) {
    const [result] = await pool.execute(
        'DELETE FROM objetos WHERE id_objeto = ?',
        [objectId]
    );
    return result.affectedRows > 0;
}

/**
 * Verificar si un objeto tiene reportes asociados
 */
export async function objectHasReports(objectId) {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM reportes WHERE id_objeto = ?',
        [objectId]
    );
    
    return rows[0].count > 0;
}

export default {
    getAllObjects,
    getObjectsByCategory,
    getObjectById,
    createObject,
    updateObject,
    deleteObject,
    objectHasReports
};