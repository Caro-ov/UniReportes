import pool from '../config/db.js';

/**
 * Obtener todas las categorías
 */
export async function getAllCategories() {
    const [rows] = await pool.execute(
        'SELECT * FROM categorias ORDER BY nombre ASC'
    );
    return rows;
}

/**
 * Obtener una categoría por ID
 */
export async function getCategoryById(categoryId) {
    const [rows] = await pool.execute(
        'SELECT * FROM categorias WHERE id_categoria = ?',
        [categoryId]
    );
    return rows[0] || null;
}

/**
 * Crear una nueva categoría
 */
export async function createCategory(categoryData) {
    const { nombre, descripcion, id_dependencia = null } = categoryData;
    
    const [result] = await pool.execute(
        'INSERT INTO categorias (nombre, descripcion, id_dependencia) VALUES (?, ?, ?)',
        [nombre, descripcion, id_dependencia]
    );
    
    return result.insertId;
}

/**
 * Actualizar una categoría
 */
export async function updateCategory(categoryId, updateData) {
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

    values.push(categoryId);

    const [result] = await pool.execute(
        `UPDATE categorias SET ${fields.join(', ')} WHERE id_categoria = ?`,
        values
    );

    return result.affectedRows > 0;
}

/**
 * Eliminar una categoría
 */
export async function deleteCategory(categoryId) {
    const [result] = await pool.execute(
        'DELETE FROM categorias WHERE id_categoria = ?',
        [categoryId]
    );
    return result.affectedRows > 0;
}

/**
 * Obtener estadísticas de categorías
 */
export async function getCategoriesStats() {
    const [rows] = await pool.execute(`
        SELECT 
            c.id_categoria,
            c.nombre,
            COUNT(r.id_reporte) as total_reportes,
            SUM(CASE WHEN r.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN r.estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos
        FROM categorias c
        LEFT JOIN reportes r ON c.id_categoria = r.id_categoria
        GROUP BY c.id_categoria, c.nombre
        ORDER BY total_reportes DESC, c.nombre ASC
    `);
    
    return rows;
}

/**
 * Verificar si una categoría tiene reportes asociados
 */
export async function categoryHasReports(categoryId) {
    const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM reportes WHERE id_categoria = ?',
        [categoryId]
    );
    
    return rows[0].count > 0;
}

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesStats,
    categoryHasReports
};
