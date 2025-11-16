import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

// Solo cargar dotenv en desarrollo (Railway inyecta variables automáticamente)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.temp' });
    if (!process.env.EMAIL_USER) {
        dotenv.config();
    }
}

// Log de verificación de variables
console.log('🔍 Verificando configuración de email...');
const isProduction = process.env.NODE_ENV === 'production';
const useResend = isProduction && process.env.RESEND_API_KEY;

if (useResend) {
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Configurado' : '✗ Falta');
} else {
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Configurado' : '✗ Falta');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Configurado' : '✗ Falta');
}

// Configurar servicio de email según el entorno
let transporter = null;
let resendClient = null;

if (useResend) {
    // PRODUCCIÓN: Usar Resend
    console.log('📧 Modo: Producción - Usando Resend API');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Servicio de email Resend configurado');
    
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // DESARROLLO: Usar Gmail SMTP
    console.log('📧 Modo: Desarrollo - Usando Gmail SMTP');
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Verificar conexión Gmail
    transporter.verify()
        .then(() => {
            console.log('✅ Servicio de email Gmail listo');
        })
        .catch((error) => {
            console.error('❌ Error al conectar con Gmail:', error.message);
        });
} else {
    console.warn('⚠️  No hay configuración de email disponible. Emails deshabilitados.');
}

/**
 * Enviar notificación de nuevo reporte
 */
export const enviarNotificacionNuevoReporte = async (reporte, usuarioReporta) => {
    if (!transporter) {
        console.warn('⚠️  Email deshabilitado: no hay transporter configurado');
        return { success: false, error: 'Email no configurado' };
    }
    
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
    if (!transporter) {
        console.warn('⚠️  Email deshabilitado: no hay transporter configurado');
        return { success: false, error: 'Email no configurado' };
    }
    
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
export const enviarNotificacionNuevoComentario = async (reporte, comentario, usuario) => {
    if (!transporter) {
        console.warn('⚠️  Email deshabilitado: no hay transporter configurado');
        return { success: false, error: 'Email no configurado' };
    }
    
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
    // Verificar que haya un servicio de email configurado
    if (!resendClient && !transporter) {
        console.warn('⚠️  Email deshabilitado: no hay servicio configurado');
        return { success: false, error: 'Email no configurado' };
    }
    
    try {
        console.log(`📤 Enviando email a: ${destinatario}`);
        
        if (resendClient) {
            // USAR RESEND (Producción)
            console.log('🔧 Enviando via Resend API...');
            const data = await resendClient.emails.send({
                from: 'UniReportes <onboarding@resend.dev>',
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
            });
            
            console.log('📊 Respuesta de Resend:', JSON.stringify(data));
            console.log('✅ Email enviado via Resend. ID:', data?.id || 'No disponible');
            return { success: true, messageId: data?.id, data };
            
        } else {
            // USAR NODEMAILER/GMAIL (Desarrollo)
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
            
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email enviado via Gmail:', info.messageId);
            return { success: true, messageId: info.messageId };
        }
        
    } catch (error) {
        console.error('❌ Error al enviar email:', error.message);
        console.error('📋 Detalles del error:', error);
        if (error.statusCode) {
            console.error('🔴 Status Code:', error.statusCode);
        }
        if (error.name) {
            console.error('🔴 Error Name:', error.name);
        }
        return { success: false, error: error.message };
    }
};

export default {
    enviarNotificacionNuevoReporte,
    enviarNotificacionCambioEstado,
    enviarNotificacionNuevoComentario,
    enviarNotificacionGenerica
};
