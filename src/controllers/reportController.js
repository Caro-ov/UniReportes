import * as reportModel from '../models/reportModel.js';
import * as categoryModel from '../models/categoryModel.js';
import * as fileModel from '../models/fileModel.js';
import * as historialModel from '../models/historialModel.js';
import path from 'path';

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
        
        // Log específico para el reporte 12
        const reporte12 = reports.find(r => r.id_reporte === 12);
        if (reporte12) {
            console.log('🔍 REPORTE 12 ESPECÍFICO:', {
                id: reporte12.id_reporte,
                titulo: reporte12.titulo,
                estado: reporte12.estado,
                id_estado: reporte12.id_estado
            });
        } else {
            console.log('❌ REPORTE 12 NO ENCONTRADO en la consulta');
        }
        
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
        const userRole = req.session.user?.rol;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que el usuario no sea administrador
        if (userRole === 'Administrador') {
            return res.status(403).json({
                success: false,
                message: 'Los administradores no pueden crear reportes'
            });
        }

        const { titulo, descripcion, id_salon, id_categoria, fecha_reporte } = req.body;

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
            id_usuario: userId,
            fecha_reporte: fecha_reporte || null
        };

        const reportId = await reportModel.createReport(reportData);

        // Manejar archivos si se subieron
        let archivosGuardados = [];
        if (req.files && req.files.length > 0) {
            console.log(`📁 ${req.files.length} archivos recibidos:`, req.files.map(f => f.originalname));
            
            for (const file of req.files) {
                try {
                    const fileData = {
                        id_reporte: reportId,
                        url: file.path.replace(/\\/g, '/'), // Normalizar path para BD
                        tipo: file.mimetype
                    };

                    const fileId = await fileModel.createFile(fileData);
                    console.log(`✅ Archivo ${file.originalname} guardado en BD con ID:`, fileId);
                    
                    archivosGuardados.push({
                        id: fileId,
                        nombre: file.originalname,
                        tipo: file.mimetype,
                        url: file.path.replace(/\\/g, '/')
                    });
                } catch (fileError) {
                    console.error(`❌ Error guardando archivo ${file.originalname} en BD:`, fileError);
                    // Continúa con el siguiente archivo si hay error
                }
            }
            
            if (archivosGuardados.length > 0) {
                res.status(201).json({
                    success: true,
                    message: `Reporte creado exitosamente con ${archivosGuardados.length} archivo(s)`,
                    data: { 
                        id: reportId,
                        archivos: archivosGuardados
                    }
                });
            } else {
                res.status(201).json({
                    success: true,
                    message: 'Reporte creado pero hubo errores con los archivos',
                    data: { id: reportId },
                    warning: 'Los archivos no pudieron ser procesados'
                });
            }
        } else {
            res.status(201).json({
                success: true,
                message: 'Reporte creado exitosamente',
                data: { id: reportId }
            });
        }
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

        const { titulo, descripcion, id_salon, id_categoria, fecha_reporte, estado } = req.body;
        const updateData = {};
        const cambios = [];

        // Registrar cambios para el historial
        if (titulo && titulo.trim() !== existingReport.titulo) {
            updateData.titulo = titulo.trim();
            cambios.push({
                campo: 'titulo',
                valor_anterior: existingReport.titulo,
                valor_nuevo: titulo.trim()
            });
        }

        if (descripcion && descripcion.trim() !== existingReport.descripcion) {
            updateData.descripcion = descripcion.trim();
            cambios.push({
                campo: 'descripcion',
                valor_anterior: existingReport.descripcion,
                valor_nuevo: descripcion.trim()
            });
        }

        if (id_salon && id_salon != existingReport.id_salon) {
            updateData.id_salon = id_salon;
            cambios.push({
                campo: 'id_salon',
                valor_anterior: existingReport.id_salon?.toString(),
                valor_nuevo: id_salon.toString()
            });
        }

        if (id_categoria !== undefined && id_categoria != existingReport.id_categoria) {
            updateData.id_categoria = id_categoria || null;
            cambios.push({
                campo: 'id_categoria',
                valor_anterior: existingReport.id_categoria?.toString() || 'null',
                valor_nuevo: id_categoria?.toString() || 'null'
            });
        }

        if (fecha_reporte && fecha_reporte !== existingReport.fecha_reporte) {
            updateData.fecha_reporte = fecha_reporte;
            cambios.push({
                campo: 'fecha_reporte',
                valor_anterior: existingReport.fecha_reporte,
                valor_nuevo: fecha_reporte
            });
        }

        // Solo admin puede cambiar estado
        if (estado && userRole === 'admin' && estado !== existingReport.estado) {
            updateData.estado = estado;
            cambios.push({
                campo: 'estado',
                valor_anterior: existingReport.estado,
                valor_nuevo: estado
            });
        }

        // Si no hay cambios, devolver mensaje
        if (Object.keys(updateData).length === 0) {
            return res.json({
                success: true,
                message: 'No hay cambios para actualizar'
            });
        }

        // Actualizar reporte
        const success = await reportModel.updateReport(reportId, updateData);

        if (success) {
            // Registrar cambios en el historial si hay cambios
            if (cambios.length > 0) {
                try {
                    await historialModel.createHistorialEntry({
                        id_reporte: reportId,
                        tipo: 'edicion',
                        id_usuario_actor: userId,
                        descripcion: `Reporte editado: ${cambios.map(c => c.campo).join(', ')}`,
                        cambios_json: JSON.stringify(cambios)
                    });
                    console.log(`📝 Registrados ${cambios.length} cambios en el historial del reporte ${reportId}`);
                } catch (historialError) {
                    console.error('❌ Error registrando en historial:', historialError);
                    // No fallar la actualización por error en historial
                }
            }

            res.json({
                success: true,
                message: 'Reporte actualizado exitosamente',
                cambios: cambios.length
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

        console.log('🔄 Actualizando estado del reporte:', { reportId, estado, userRole });

        if (userRole !== 'admin') {
            console.log('❌ Usuario no es admin:', { userRole });
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden cambiar el estado'
            });
        }

        if (!reportId || !estado) {
            console.log('❌ Faltan parámetros:', { reportId, estado });
            return res.status(400).json({
                success: false,
                message: 'ID de reporte y estado son requeridos'
            });
        }

        const validStates = ['pendiente', 'revisado', 'en proceso', 'resuelto'];
        console.log('🔍 Validando estado:', { estado, estadoLower: estado.toLowerCase(), validStates });
        
        if (!validStates.includes(estado.toLowerCase())) {
            console.log('❌ Estado no válido:', { estado, validStates });
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const success = await reportModel.updateReportStatus(reportId, estado, req.session.user?.id_usuario);

        if (success) {
            console.log('✅ Estado actualizado exitosamente');
            res.json({
                success: true,
                message: 'Estado actualizado exitosamente'
            });
        } else {
            console.log('❌ Reporte no encontrado');
            res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
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

/**
 * Obtener historial de cambios de un reporte (API)
 */
export async function getReportHistorial(req, res) {
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
        const report = await reportModel.getReportById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Verificar permisos: solo el propietario o admin pueden ver el historial
        if (report.id_usuario !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver el historial de este reporte'
            });
        }

        const historial = await historialModel.getHistorialByReportId(reportId);

        res.json({
            success: true,
            data: historial
        });

    } catch (error) {
        console.error('Error obteniendo historial del reporte:', error);
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
    getReportsStats,
    getReportHistorial
};
