import CommentModel from '../models/commentModel.js';

// Controlador para manejar comentarios de reportes
const commentController = {
    // Obtener comentarios de un reporte
    async getByReportId(req, res) {
        try {
            const { reportId } = req.params;
            console.log(`📋 commentController: Obteniendo comentarios del reporte ${reportId}`);
            
            if (!reportId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reporte requerido'
                });
            }
            
            const comments = await CommentModel.getByReportId(reportId);
            
            // Formatear los comentarios para el frontend
            const formattedComments = comments.map(comment => ({
                id: comment.id_comentario,
                reporte_id: comment.id_reporte,
                usuario_id: comment.id_usuario,
                texto: comment.comentario,
                fecha: comment.fecha,
                autor: {
                    nombre: comment.usuario_nombre || 'Usuario desconocido',
                    rol: comment.usuario_rol || 'monitor'
                }
            }));
            
            res.json({
                success: true,
                data: formattedComments
            });
            
        } catch (error) {
            console.error('❌ commentController: Error obteniendo comentarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Crear un nuevo comentario
    async create(req, res) {
        try {
            const { reportId } = req.params;
            const { comentario } = req.body;
            const userId = req.session.user?.id;
            
            console.log(`📝 commentController: Creando comentario en reporte ${reportId} por usuario ${userId}`);
            
            // Validaciones
            if (!reportId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reporte requerido'
                });
            }

            if (!comentario || comentario.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El comentario no puede estar vacío'
                });
            }

            if (comentario.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'El comentario debe tener al menos 10 caracteres'
                });
            }

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Debes estar autenticado para comentar'
                });
            }            // Crear el comentario
            const commentData = {
                id_reporte: reportId,
                id_usuario: userId,
                comentario: comentario.trim()
            };
            
            const newComment = await CommentModel.create(commentData);
            
            // Formatear respuesta
            const formattedComment = {
                id: newComment.id_comentario,
                reporte_id: newComment.id_reporte,
                usuario_id: newComment.id_usuario,
                texto: newComment.comentario,
                fecha: newComment.fecha,
                autor: {
                    nombre: newComment.usuario_nombre || 'Usuario desconocido',
                    rol: newComment.usuario_rol || 'monitor'
                }
            };
            
            res.status(201).json({
                success: true,
                data: formattedComment,
                message: 'Comentario creado exitosamente'
            });
            
        } catch (error) {
            console.error('❌ commentController: Error creando comentario:', error);
            
            if (error.message.includes('Foreign key constraint')) {
                return res.status(400).json({
                    success: false,
                    message: 'El reporte especificado no existe'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Eliminar un comentario
    async delete(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.session.user?.id;
            
            console.log(`🗑️ commentController: Eliminando comentario ${commentId} por usuario ${userId}`);
            
            if (!commentId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de comentario requerido'
                });
            }
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Debes estar autenticado para eliminar comentarios'
                });
            }
            
            await CommentModel.delete(commentId, userId);
            
            res.json({
                success: true,
                message: 'Comentario eliminado exitosamente'
            });
            
        } catch (error) {
            console.error('❌ commentController: Error eliminando comentario:', error);
            
            if (error.message.includes('No tienes permisos')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

export default commentController;