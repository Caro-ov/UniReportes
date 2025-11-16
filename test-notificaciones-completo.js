/**
 * Script de prueba para verificar notificaciones con email
 * Prueba el sistema completo: BD + Email
 */

import dotenv from 'dotenv';
import notificationService from './src/services/notificationService.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.temp' });

console.log('\n🧪 === TEST DE NOTIFICACIONES CON EMAIL ===\n');

// Verificar configuración
console.log('📋 Variables de entorno:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NO CONFIGURADO');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Configurado' : '❌ NO CONFIGURADO');
console.log('EMAIL_ADMIN:', process.env.EMAIL_ADMIN || '❌ NO CONFIGURADO');
console.log('APP_URL:', process.env.APP_URL || 'http://localhost:3000');

console.log('\n🔄 Probando notificación de cambio de estado...\n');

// Simular una notificación de cambio de estado
const testData = {
    id_usuario_destino: 1, // Admin
    id_reporte: 1, // Primer reporte de prueba
    tipo: 'cambio_estado',
    titulo: 'Tu reporte ha sido actualizado',
    mensaje: 'El estado de tu reporte ha cambiado a: En proceso',
    prioridad: 2,
    color: 'azul'
};

try {
    const resultado = await notificationService.crearYNotificar(testData);
    
    console.log('\n✅ Resultado:');
    console.log('- Notificación ID:', resultado);
    console.log('- Check tu email:', process.env.EMAIL_ADMIN);
    console.log('\n💡 Si no recibes el email, revisa:');
    console.log('1. Carpeta de spam');
    console.log('2. Que el usuario ID 1 exista en la BD');
    console.log('3. Que el reporte ID 1 exista en la BD');
    console.log('4. Los logs anteriores por errores de conexión\n');
    
    process.exit(0);
} catch (error) {
    console.error('\n❌ Error en la prueba:', error);
    console.error('\n📝 Detalles:', error.message);
    process.exit(1);
}
