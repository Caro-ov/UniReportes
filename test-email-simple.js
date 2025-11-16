import dotenv from 'dotenv';

// Cargar variables ANTES de importar emailService
dotenv.config({ path: '.env.temp' });

// Verificar que se cargaron las variables
console.log('📧 Probando servicio de email...');
console.log('📮 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurada' : '❌ Falta');

import emailService from './src/services/emailService.js';

const probarEmail = async () => {
    try {
        const resultado = await emailService.enviarNotificacionGenerica(
            'carlos15.ci15@gmail.com',  // Tu mismo correo para probar
            '✅ Prueba de UniReportes - Email funcionando',
            `
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
        );

        if (resultado.success) {
            console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
            console.log('📬 Message ID:', resultado.messageId);
            console.log('\n🎯 Revisa tu bandeja de entrada (o spam) en carlos15.ci15@gmail.com');
        } else {
            console.error('❌ Error al enviar:', resultado.error);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

probarEmail();
