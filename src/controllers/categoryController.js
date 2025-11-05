import * as categoryModel from '../models/categoryModel.js';
import pool from '../config/db.js';

/**
 * Obtener todas las categorías (API)
 */
export async function getAllCategories(req, res) {
    try {
        const categories = await categoryModel.getAllCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener una categoría específica (API)
 */
export async function getCategoryById(req, res) {
    try {
        const categoryId = parseInt(req.params.id);
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const category = await categoryModel.getCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Crear una nueva categoría (API - solo admin)
 */
export async function createCategory(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear categorías'
            });
        }

        const { nombre, descripcion, color } = req.body;

        // Validar campos requeridos
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        // Validar formato de color (hex)
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            return res.status(400).json({
                success: false,
                message: 'El color debe estar en formato hexadecimal (#RRGGBB)'
            });
        }

        const categoryData = {
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null,
            color: color || '#3B82F6'
        };

        const categoryId = await categoryModel.createCategory(categoryData);

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: { id: categoryId }
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        
        // Manejar error de duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Actualizar una categoría (API - solo admin)
 */
export async function updateCategory(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar categorías'
            });
        }

        const categoryId = parseInt(req.params.id);
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await categoryModel.getCategoryById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const { nombre, descripcion, color } = req.body;
        const updateData = {};

        if (nombre) updateData.nombre = nombre.trim();
        if (descripcion !== undefined) updateData.descripcion = descripcion ? descripcion.trim() : null;
        
        // Validar formato de color si se proporciona
        if (color) {
            if (!/^#[0-9A-F]{6}$/i.test(color)) {
                return res.status(400).json({
                    success: false,
                    message: 'El color debe estar en formato hexadecimal (#RRGGBB)'
                });
            }
            updateData.color = color;
        }

        const success = await categoryModel.updateCategory(categoryId, updateData);

        if (success) {
            res.json({
                success: true,
                message: 'Categoría actualizada exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la categoría'
            });
        }
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        
        // Manejar error de duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Eliminar una categoría (API - solo admin)
 */
export async function deleteCategory(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar categorías'
            });
        }

        const categoryId = parseInt(req.params.id);
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await categoryModel.getCategoryById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar si tiene reportes asociados
        const hasReports = await categoryModel.categoryHasReports(categoryId);
        if (hasReports) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar una categoría que tiene reportes asociados'
            });
        }

        const success = await categoryModel.deleteCategory(categoryId);

        if (success) {
            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la categoría'
            });
        }
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas de categorías (API - solo admin)
 */
export async function getCategoriesStats(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver estadísticas'
            });
        }

        const stats = await categoryModel.getCategoriesStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener todos los estados (API)
 */
export async function getAllStates(req, res) {
    try {
        const [states] = await pool.execute(`
            SELECT id_estado, nombre, orden 
            FROM estados 
            ORDER BY orden ASC
        `);

        res.json({
            success: true,
            data: states
        });
    } catch (error) {
        console.error('Error al obtener estados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesStats,
    getAllStates
};
