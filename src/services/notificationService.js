import notificationModel from '../models/notificationModel.js';
import emailService from './emailService.js';
import pool from '../config/db.js';

/**
 * Servicio para gestionar notificaciones (BD + Email)
 */
const notificationService = {
    /**
     * Crear notificación en BD y enviar email
     */
    async crearYNotificar(data) {
        try {
            const { 
                id_usuario_destino, 
                id_reporte, 
                tipo, 
                titulo, 
                mensaje, 
                prioridad = 1, 
                color = 'azul' 
            } = data;

            // 1. Crear notificación en la base de datos
            const notificationId = await notificationModel.create(data);
            console.log(`✅ Notificación creada en BD: ${notificationId}`);

            // 2. Obtener datos del usuario destinatario
            const [usuarios] = await pool.execute(
                'SELECT nombre, correo FROM usuarios WHERE id_usuario = ?',
                [id_usuario_destino]
            );

            if (usuarios.length === 0) {
                console.warn(`⚠️ Usuario ${id_usuario_destino} no encontrado`);
                return notificationId;
            }

            const usuario = usuarios[0];

            // 3. Obtener datos del reporte
            const [reportes] = await pool.execute(
                `SELECT r.*, c.nombre as categoria_nombre, e.nombre as estado_nombre
                 FROM reportes r
                 LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
                 LEFT JOIN estados e ON r.id_estado = e.id_estado
                 WHERE r.id_reporte = ?`,
                [id_reporte]
            );

            if (reportes.length === 0) {
                console.warn(`⚠️ Reporte ${id_reporte} no encontrado`);
                return notificationId;
            }

            const reporte = reportes[0];

            // 4. Enviar email según el tipo de notificación
            try {
                let emailSubject = '';
                let emailHtml = '';

                switch (tipo) {
                    case 'comentario':
                        emailSubject = `💬 Nuevo comentario en: ${reporte.titulo}`;
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1173d4;">💬 Nuevo Comentario</h2>
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Reporte:</strong> ${reporte.titulo}</p>
                                    <p style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #1173d4;">
                                        ${mensaje}
                                    </p>
                                </div>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/detalle-reporte.html?id=${id_reporte}" 
                                   style="display: inline-block; background: #1173d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                                    Ver Reporte
                                </a>
                            </div>
                        `;
                        break;

                    case 'cambio_estado':
                        emailSubject = `📋 Actualización: ${reporte.titulo}`;
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1173d4;">📋 Estado Actualizado</h2>
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Reporte:</strong> ${reporte.titulo}</p>
                                    <p><strong>Nuevo Estado:</strong> <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px;">${reporte.estado_nombre}</span></p>
                                    <p style="color: #6b7280; margin-top: 10px;">${mensaje}</p>
                                </div>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/detalle-reporte.html?id=${id_reporte}" 
                                   style="display: inline-block; background: #1173d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                                    Ver Detalles
                                </a>
                            </div>
                        `;
                        break;

                    case 'nuevo_reporte':
                        emailSubject = `🚨 Nuevo Reporte: ${reporte.titulo}`;
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1173d4;">🚨 Nuevo Reporte Creado</h2>
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Título:</strong> ${reporte.titulo}</p>
                                    <p><strong>Categoría:</strong> ${reporte.categoria_nombre}</p>
                                    <p><strong>Descripción:</strong></p>
                                    <p style="padding: 10px; background: white; border-left: 4px solid #1173d4;">${reporte.descripcion}</p>
                                </div>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/detalle-reporte-admin.html?id=${id_reporte}" 
                                   style="display: inline-block; background: #1173d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                                    Revisar Reporte
                                </a>
                            </div>
                        `;
                        break;

                    case 'asignacion':
                        emailSubject = `👤 Te asignaron: ${reporte.titulo}`;
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1173d4;">👤 Reporte Asignado</h2>
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p>Te han asignado el siguiente reporte:</p>
                                    <p><strong>Título:</strong> ${reporte.titulo}</p>
                                    <p><strong>Categoría:</strong> ${reporte.categoria_nombre}</p>
                                    <p style="color: #6b7280; margin-top: 10px;">${mensaje}</p>
                                </div>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/detalle-reporte-admin.html?id=${id_reporte}" 
                                   style="display: inline-block; background: #1173d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                                    Ver Reporte
                                </a>
                            </div>
                        `;
                        break;

                    default:
                        // Notificación genérica
                        emailSubject = titulo || `📢 Nueva Notificación - ${reporte.titulo}`;
                        emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #1173d4;">${titulo}</h2>
                                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p>${mensaje}</p>
                                    <p><strong>Reporte:</strong> ${reporte.titulo}</p>
                                </div>
                                <a href="${process.env.APP_URL || 'http://localhost:3000'}/detalle-reporte.html?id=${id_reporte}" 
                                   style="display: inline-block; background: #1173d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                                    Ver Más
                                </a>
                            </div>
                        `;
                }

                // Enviar email
                console.log(`📧 Intentando enviar email a ${usuario.correo} (tipo: ${tipo})`);
                const resultadoEmail = await emailService.enviarNotificacionGenerica(
                    usuario.correo,
                    emailSubject,
                    emailHtml
                );

                if (resultadoEmail.success) {
                    console.log(`✅ Email enviado exitosamente a ${usuario.correo}`);
                } else {
                    console.warn(`⚠️ No se pudo enviar email a ${usuario.correo}:`, resultadoEmail.error);
                }

            } catch (emailError) {
                console.error('❌ Error al enviar email (notificación creada en BD):', emailError);
                // No lanzar error - la notificación ya está en BD
            }

            return notificationId;

        } catch (error) {
            console.error('❌ Error al crear notificación:', error);
            throw error;
        }
    },

    /**
     * Notificar a múltiples usuarios (ej: todos los admins)
     */
    async notificarMultiples(usuarios, data) {
        const resultados = [];

        for (const usuario of usuarios) {
            try {
                const notificationData = {
                    ...data,
                    id_usuario_destino: usuario.id_usuario
                };

                const notificationId = await this.crearYNotificar(notificationData);
                resultados.push({
                    usuario: usuario.id_usuario,
                    success: true,
                    notificationId
                });

            } catch (error) {
                console.error(`❌ Error al notificar a usuario ${usuario.id_usuario}:`, error);
                resultados.push({
                    usuario: usuario.id_usuario,
                    success: false,
                    error: error.message
                });
            }
        }

        return resultados;
    },

    /**
     * Notificar a todos los administradores
     */
    async notificarAdmins(data) {
        try {
            // Obtener todos los usuarios con rol 'admin'
            const [admins] = await pool.execute(
                "SELECT id_usuario, nombre, correo FROM usuarios WHERE rol = 'admin'"
            );

            if (admins.length === 0) {
                console.warn('⚠️ No hay administradores para notificar');
                return [];
            }

            console.log(`📧 Notificando a ${admins.length} administradores`);
            return await this.notificarMultiples(admins, data);

        } catch (error) {
            console.error('❌ Error al notificar admins:', error);
            throw error;
        }
    }
};

export default notificationService;
