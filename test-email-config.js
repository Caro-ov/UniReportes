// Test simple para verificar configuración de email
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🧪 Probando configuración de Gmail...\n');

// Verificar que existan las variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: Faltan las variables EMAIL_USER o EMAIL_PASS en .env.temp');
    console.log('\n📝 Agrega estas líneas a tu archivo .env.temp:');
    console.log('EMAIL_USER=tu-correo@gmail.com');
    console.log('EMAIL_PASS=tu contraseña de aplicación (16 caracteres)');
    console.log('\n🔗 Obtén tu contraseña aquí: https://myaccount.google.com/apppasswords');
    process.exit(1);
}

console.log('✅ Variables encontradas:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`   EMAIL_PASS: ${'*'.repeat(16)} (oculta)\n`);

// Crear transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión
console.log('🔌 Verificando conexión con Gmail...');

transporter.verify((error, success) => {
    if (error) {
        console.error('\n❌ ERROR al conectar con Gmail:');
        console.error(error.message);
        console.log('\n💡 Soluciones:');
        console.log('1. Verifica que EMAIL_USER sea tu correo completo (@gmail.com)');
        console.log('2. Verifica que EMAIL_PASS sea la contraseña de aplicación (16 caracteres)');
        console.log('3. Activa la verificación en 2 pasos en tu cuenta de Google');
        console.log('4. Genera una nueva contraseña en: https://myaccount.google.com/apppasswords');
        process.exit(1);
    } else {
        console.log('✅ Conexión exitosa con Gmail!\n');
        
        // Enviar email de prueba
        console.log('📧 Enviando email de prueba...');
        
        const mailOptions = {
            from: `"UniReportes Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Se envía a ti mismo
            subject: '✅ Prueba de Email - UniReportes',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #1173d4;">🎉 ¡Funciona!</h1>
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1173d4;">
                        <p style="margin: 0; font-size: 16px;">
                            La configuración de email para <strong>UniReportes</strong> está funcionando correctamente.
                        </p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        Ahora puedes enviar notificaciones por email desde tu aplicación.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px;">
                        Este es un email de prueba enviado desde UniReportes<br>
                        Fecha: ${new Date().toLocaleString('es-CO')}
                    </p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('\n❌ ERROR al enviar email:');
                console.error(error.message);
                process.exit(1);
            } else {
                console.log('\n✅ ¡Email enviado exitosamente!');
                console.log(`📬 Revisa tu bandeja de entrada: ${process.env.EMAIL_USER}`);
                console.log(`📨 Message ID: ${info.messageId}\n`);
                console.log('🎉 El servicio de email está listo para usar!\n');
            }
        });
    }
});
