import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el transporter de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Tu correo de Gmail
        pass: process.env.EMAIL_PASS   // Tu contraseña de aplicación
    }
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error al conectar con Gmail:', error);
    } else {
        console.log('✅ Servicio de email listo para enviar correos');
    }
});

/**
 * Enviar notificación de nuevo reporte
 */
export const enviarNotificacionNuevoReporte = async (reporte, usuarioReporta) => {
    const mailOptions = {
        from: `"UniReportes" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_ADMIN || process.env.EMAIL_USER, // Email del admin
        subject: `🚨 Nuevo Reporte: ${reporte.titulo}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1173d4;">Nuevo Reporte Creado</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Título:</strong> ${reporte.titulo}</p>
                    <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
                    <p><strong>Categoría:</strong> ${reporte.categoria}</p>
                    <p><strong>Prioridad:</strong> ${reporte.prioridad}</p>
                    <p><strong>Ubicación:</strong> ${reporte.ubicacion}</p>
                    <p><strong>Reportado por:</strong> ${usuarioReporta.nombre} (${usuarioReporta.correo})</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    Revisa el reporte completo en tu panel de administración.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación de cambio de estado
 */
export const enviarNotificacionCambioEstado = async (reporte, usuario, nuevoEstado) => {
    const mailOptions = {
        from: `"UniReportes" <${process.env.EMAIL_USER}>`,
        to: usuario.correo,
        subject: `📋 Actualización de tu Reporte: ${reporte.titulo}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1173d4;">Estado de tu Reporte Actualizado</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Reporte:</strong> ${reporte.titulo}</p>
                    <p><strong>Nuevo Estado:</strong> <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px;">${nuevoEstado}</span></p>
                    <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    Puedes ver más detalles en tu panel de reportes.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación de nuevo comentario
 */
export const enviarNotificacionNuevoComentario = async (reporte, comentario, autor, destinatario) => {
    const mailOptions = {
        from: `"UniReportes" <${process.env.EMAIL_USER}>`,
        to: destinatario.correo,
        subject: `💬 Nuevo Comentario en: ${reporte.titulo}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1173d4;">Nuevo Comentario</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>En el reporte:</strong> ${reporte.titulo}</p>
                    <p><strong>Comentó:</strong> ${autor.nombre}</p>
                    <p style="margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #1173d4;">
                        ${comentario.contenido}
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    Responde desde tu panel de reportes.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación genérica
 */
export const enviarNotificacionGenerica = async (destinatario, asunto, mensaje) => {
    const mailOptions = {
        from: `"UniReportes" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: asunto,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1173d4;">UniReportes</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${mensaje}
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        return { success: false, error: error.message };
    }
};

export default {
    enviarNotificacionNuevoReporte,
    enviarNotificacionCambioEstado,
    enviarNotificacionNuevoComentario,
    enviarNotificacionGenerica
};
