import db from '../config/db.js';

// Modelo para manejar comentarios de reportes
const CommentModel = {
    // Obtener todos los comentarios de un reporte
    async getByReportId(reportId) {
        console.log(`📋 CommentModel: Obteniendo comentarios del reporte ${reportId}`);
        
        try {
            const query = `
                SELECT 
                    c.id_comentario,
                    c.id_reporte,
                    c.id_usuario,
                    c.comentario,
                    c.fecha,
                    u.nombre as usuario_nombre,
                    u.rol as usuario_rol
                FROM comentarios c
                LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
                WHERE c.id_reporte = ?
                ORDER BY c.fecha ASC
            `;
            
            const [rows] = await db.execute(query, [reportId]);
            console.log(`📋 CommentModel: ${rows.length} comentarios encontrados`);
            
            return rows;
        } catch (error) {
            console.error('❌ CommentModel: Error obteniendo comentarios:', error);
            throw error;
        }
    },

    // Crear un nuevo comentario
    async create(commentData) {
        console.log('📝 CommentModel: Creando nuevo comentario:', commentData);
        
        try {
            const query = `
                INSERT INTO comentarios (id_reporte, id_usuario, comentario, fecha)
                VALUES (?, ?, ?, NOW())
            `;
            
            const [result] = await db.execute(query, [
                commentData.id_reporte,
                commentData.id_usuario,
                commentData.comentario
            ]);
            
            console.log('✅ CommentModel: Comentario creado con ID:', result.insertId);
            
            // Obtener el comentario completo con datos del usuario
            return await this.getById(result.insertId);
        } catch (error) {
            console.error('❌ CommentModel: Error creando comentario:', error);
            throw error;
        }
    },

    // Obtener un comentario por ID
    async getById(commentId) {
        console.log(`📋 CommentModel: Obteniendo comentario ${commentId}`);
        
        try {
            const query = `
                SELECT 
                    c.id_comentario,
                    c.id_reporte,
                    c.id_usuario,
                    c.comentario,
                    c.fecha,
                    u.nombre as usuario_nombre,
                    u.rol as usuario_rol
                FROM comentarios c
                LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
                WHERE c.id_comentario = ?
            `;
            
            const [rows] = await db.execute(query, [commentId]);
            
            if (rows.length === 0) {
                throw new Error('Comentario no encontrado');
            }
            
            return rows[0];
        } catch (error) {
            console.error('❌ CommentModel: Error obteniendo comentario:', error);
            throw error;
        }
    },

    // Eliminar un comentario
    async delete(commentId, userId) {
        console.log(`🗑️ CommentModel: Eliminando comentario ${commentId} por usuario ${userId}`);
        
        try {
            // Verificar que el comentario existe y pertenece al usuario
            const comment = await this.getById(commentId);
            
            if (comment.id_usuario !== userId) {
                throw new Error('No tienes permisos para eliminar este comentario');
            }
            
            const query = `DELETE FROM comentarios WHERE id_comentario = ?`;
            const [result] = await db.execute(query, [commentId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Comentario no encontrado');
            }
            
            console.log('✅ CommentModel: Comentario eliminado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ CommentModel: Error eliminando comentario:', error);
            throw error;
        }
    }
};

export default CommentModel;