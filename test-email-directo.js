import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.temp' });

console.log('📧 Test de Email - UniReportes');
console.log('================================');
console.log('📮 Usuario:', process.env.EMAIL_USER);
console.log('🔑 Contraseña:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}...` : '❌ NO CONFIGURADA');
console.log('================================\n');

// Configurar transporter directamente
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('🔄 Verificando conexión con Gmail...\n');

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error al conectar:', error.message);
        process.exit(1);
    } else {
        console.log('✅ Conexión exitosa con Gmail!\n');
        enviarEmailPrueba();
    }
});

async function enviarEmailPrueba() {
    const mailOptions = {
        from: `"UniReportes" <${process.env.EMAIL_USER}>`,
        to: 'carlos15.ci15@gmail.com',
        subject: '✅ Prueba de Email - UniReportes',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1173d4;">🎉 ¡Email configurado correctamente!</h2>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <p style="font-size: 16px; margin: 0;">
                        El servicio de notificaciones por email de <strong>UniReportes</strong> está funcionando perfectamente.
                    </p>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                    <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    <p style="margin: 5px 0;"><strong>🔧 Configuración:</strong> Gmail SMTP</p>
                    <p style="margin: 5px 0;"><strong>✉️ Desde:</strong> ${process.env.EMAIL_USER}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    Ya puedes recibir notificaciones automáticas cuando:
                </p>
                <ul style="color: #6b7280; font-size: 14px;">
                    <li>Se crea un nuevo reporte</li>
                    <li>Cambia el estado de un reporte</li>
                    <li>Hay un nuevo comentario</li>
                    <li>Te asignan un reporte</li>
                </ul>
            </div>
        `
    };

    try {
        console.log('📤 Enviando email de prueba...\n');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
        console.log('📬 Message ID:', info.messageId);
        console.log('\n🎯 Revisa tu bandeja de entrada (o carpeta de spam) en carlos15.ci15@gmail.com\n');
    } catch (error) {
        console.error('❌ Error al enviar:', error.message);
    }
}
