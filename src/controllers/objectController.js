import * as objectModel from '../models/objectModel.js';

/**
 * Obtener todos los objetos (API)
 */
export async function getAllObjects(req, res) {
    try {
        const objects = await objectModel.getAllObjects();
        
        res.json({
            success: true,
            data: objects
        });
    } catch (error) {
        console.error('Error al obtener objetos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener objetos por categoría (API)
 */
export async function getObjectsByCategory(req, res) {
    try {
        const categoryId = parseInt(req.params.categoryId);
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const objects = await objectModel.getObjectsByCategory(categoryId);
        
        res.json({
            success: true,
            data: objects
        });
    } catch (error) {
        console.error('Error al obtener objetos por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener un objeto específico (API)
 */
export async function getObjectById(req, res) {
    try {
        const objectId = parseInt(req.params.id);
        if (!objectId) {
            return res.status(400).json({
                success: false,
                message: 'ID de objeto inválido'
            });
        }

        const object = await objectModel.getObjectById(objectId);
        if (!object) {
            return res.status(404).json({
                success: false,
                message: 'Objeto no encontrado'
            });
        }

        res.json({
            success: true,
            data: object
        });
    } catch (error) {
        console.error('Error al obtener objeto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Crear un nuevo objeto (API - solo admin)
 */
export async function createObject(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear objetos'
            });
        }

        const { nombre, especificaciones, id_categoria } = req.body;

        // Validar campos requeridos
        if (!nombre || !id_categoria) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y categoría son requeridos'
            });
        }

        const objectData = {
            nombre: nombre.trim(),
            especificaciones: especificaciones?.trim() || null,
            id_categoria
        };

        const objectId = await objectModel.createObject(objectData);

        res.status(201).json({
            success: true,
            message: 'Objeto creado exitosamente',
            data: { id: objectId }
        });
    } catch (error) {
        console.error('Error al crear objeto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Actualizar un objeto (API - solo admin)
 */
export async function updateObject(req, res) {
    try {
        const objectId = parseInt(req.params.id);
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden actualizar objetos'
            });
        }

        if (!objectId) {
            return res.status(400).json({
                success: false,
                message: 'ID de objeto inválido'
            });
        }

        // Verificar que el objeto existe
        const existingObject = await objectModel.getObjectById(objectId);
        if (!existingObject) {
            return res.status(404).json({
                success: false,
                message: 'Objeto no encontrado'
            });
        }

        const { nombre, especificaciones, id_categoria } = req.body;
        const updateData = {};

        if (nombre) updateData.nombre = nombre.trim();
        if (especificaciones !== undefined) updateData.especificaciones = especificaciones?.trim() || null;
        if (id_categoria) updateData.id_categoria = id_categoria;

        const success = await objectModel.updateObject(objectId, updateData);

        if (success) {
            res.json({
                success: true,
                message: 'Objeto actualizado exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el objeto'
            });
        }
    } catch (error) {
        console.error('Error al actualizar objeto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Eliminar un objeto (API - solo admin)
 */
export async function deleteObject(req, res) {
    try {
        const objectId = parseInt(req.params.id);
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar objetos'
            });
        }

        if (!objectId) {
            return res.status(400).json({
                success: false,
                message: 'ID de objeto inválido'
            });
        }

        // Verificar que el objeto no tiene reportes asociados
        const hasReports = await objectModel.objectHasReports(objectId);
        if (hasReports) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el objeto porque tiene reportes asociados'
            });
        }

        const success = await objectModel.deleteObject(objectId);

        if (success) {
            res.json({
                success: true,
                message: 'Objeto eliminado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Objeto no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al eliminar objeto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getAllObjects,
    getObjectsByCategory,
    getObjectById,
    createObject,
    updateObject,
    deleteObject
};