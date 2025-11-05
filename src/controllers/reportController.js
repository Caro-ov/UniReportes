import * as reportModel from '../models/reportModel.js';
import * as categoryModel from '../models/categoryModel.js';

/**
 * Obtener todos los reportes (API)
 */
export async function getAllReports(req, res) {
    try {
        console.log('🔍 getAllReports: Iniciando...');
        console.log('👤 Usuario sesión:', req.session?.user?.id, req.session?.user?.correo);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        console.log('📄 Paginación:', { page, limit, offset });

        const reports = await reportModel.getAllReports(limit, offset);
        console.log('📊 Reportes obtenidos del modelo:', reports.length);
        console.log('🔍 Primer reporte (ejemplo):', reports[0]);
        
        res.json({
            success: true,
            data: reports,
            pagination: {
                page,
                limit,
                hasMore: reports.length === limit
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener reportes del usuario actual (API)
 */
export async function getUserReports(req, res) {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const reports = await reportModel.getReportsByUser(userId, limit, offset);
        
        res.json({
            success: true,
            data: reports,
            pagination: {
                page,
                limit,
                hasMore: reports.length === limit
            }
        });
    } catch (error) {
        console.error('Error al obtener reportes del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener un reporte específico (API)
 */
export async function getReportById(req, res) {
    try {
        const reportId = parseInt(req.params.id);
        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'ID de reporte inválido'
            });
        }

        const report = await reportModel.getReportById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Crear un nuevo reporte (API)
 */
export async function createReport(req, res) {
    try {
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const { titulo, descripcion, id_salon, id_categoria } = req.body;

        // Validar campos requeridos
        if (!titulo || !descripcion || !id_salon) {
            return res.status(400).json({
                success: false,
                message: 'Título, descripción y salón son requeridos'
            });
        }

        // Validar que la categoría existe si se proporciona
        if (id_categoria) {
            const category = await categoryModel.getCategoryById(id_categoria);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoría no válida'
                });
            }
        }

        const reportData = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            id_salon: parseInt(id_salon),
            id_categoria: id_categoria || null,
            id_usuario: userId
        };

        const reportId = await reportModel.createReport(reportData);

        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: { id: reportId }
        });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Actualizar un reporte (API)
 */
export async function updateReport(req, res) {
    try {
        const reportId = parseInt(req.params.id);
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'ID de reporte inválido'
            });
        }

        // Verificar que el reporte existe
        const existingReport = await reportModel.getReportById(reportId);
        if (!existingReport) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Verificar permisos: solo el propietario o admin pueden actualizar
        if (existingReport.id_usuario !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar este reporte'
            });
        }

        const { titulo, descripcion, ubicacion, id_categoria, estado } = req.body;
        const updateData = {};

        // Solo permitir ciertos campos según el rol
        if (titulo) updateData.titulo = titulo.trim();
        if (descripcion) updateData.descripcion = descripcion.trim();
        if (ubicacion) updateData.ubicacion = ubicacion.trim();
        if (id_categoria) updateData.id_categoria = id_categoria;

        // Solo admin puede cambiar estado
        if (estado && userRole === 'admin') {
            updateData.estado = estado;
        }

        const success = await reportModel.updateReport(reportId, updateData);

        if (success) {
            res.json({
                success: true,
                message: 'Reporte actualizado exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el reporte'
            });
        }
    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Actualizar estado de un reporte (API - solo admin)
 */
export async function updateReportStatus(req, res) {
    try {
        const reportId = parseInt(req.params.id);
        const { estado } = req.body;
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden cambiar el estado'
            });
        }

        if (!reportId || !estado) {
            return res.status(400).json({
                success: false,
                message: 'ID de reporte y estado son requeridos'
            });
        }

        const validStates = ['pendiente', 'en_proceso', 'resuelto', 'cerrado'];
        if (!validStates.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const success = await reportModel.updateReportStatus(reportId, estado);

        if (success) {
            res.json({
                success: true,
                message: 'Estado actualizado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Eliminar un reporte (API)
 */
export async function deleteReport(req, res) {
    try {
        const reportId = parseInt(req.params.id);
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'ID de reporte inválido'
            });
        }

        // Verificar que el reporte existe
        const existingReport = await reportModel.getReportById(reportId);
        if (!existingReport) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Verificar permisos: solo el propietario o admin pueden eliminar
        if (existingReport.id_usuario !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este reporte'
            });
        }

        const success = await reportModel.deleteReport(reportId);

        if (success) {
            res.json({
                success: true,
                message: 'Reporte eliminado exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el reporte'
            });
        }
    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Buscar reportes con filtros (API)
 */
export async function searchReports(req, res) {
    try {
        const filters = {
            estado: req.query.estado,
            id_categoria: req.query.id_categoria,
            fecha_desde: req.query.fecha_desde,
            fecha_hasta: req.query.fecha_hasta,
            buscar: req.query.q,
            limit: parseInt(req.query.limit) || 50
        };

        // Si no es admin, solo mostrar reportes del usuario
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            filters.id_usuario = req.session.user?.id;
        }

        const reports = await reportModel.getReportsFiltered(filters);

        res.json({
            success: true,
            data: reports,
            filters: filters
        });
    } catch (error) {
        console.error('Error al buscar reportes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas de reportes (API - solo admin)
 */
export async function getReportsStats(req, res) {
    try {
        const userRole = req.session.user?.rol;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver estadísticas'
            });
        }

        const stats = await reportModel.getReportsStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getAllReports,
    getUserReports,
    getReportById,
    createReport,
    updateReport,
    updateReportStatus,
    deleteReport,
    searchReports,
    getReportsStats
};
