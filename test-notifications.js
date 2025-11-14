import pool from './src/config/db.js';
import notificationModel from './src/models/notificationModel.js';

async function testNotifications() {
  try {
    console.log('🧪 Probando modelo de notificaciones...\n');

    // Probar con usuario ID 3 (Adriana Olivares - monitor)
    const userId = 3;
    console.log(`👤 Probando con usuario ID: ${userId}\n`);

    // Test 1: Obtener notificaciones no leídas
    console.log('=== Test 1: getUnreadByUserId ===');
    const unreadNotifications = await notificationModel.getUnreadByUserId(userId);
    console.log(`✅ Encontradas ${unreadNotifications.length} notificaciones no leídas`);
    unreadNotifications.forEach((notif, i) => {
      console.log(`\n${i + 1}. ${notif.titulo}`);
      console.log(`   Tipo: ${notif.tipo}, Color: ${notif.color}, Prioridad: ${notif.prioridad}`);
      console.log(`   Mensaje: ${notif.mensaje}`);
    });

    // Test 2: Contar no leídas
    console.log('\n=== Test 2: countUnread ===');
    const count = await notificationModel.countUnread(userId);
    console.log(`✅ Contador: ${count} notificaciones no leídas\n`);

    // Test 3: Obtener todas las notificaciones (con límite)
    console.log('=== Test 3: getByUserId ===');
    const allNotifications = await notificationModel.getByUserId(userId, 10, 0);
    console.log(`✅ Encontradas ${allNotifications.length} notificaciones (límite 10)\n`);

    // Ahora probar con admin (ID 1)
    const adminId = 1;
    console.log(`\n👤 Probando con admin ID: ${adminId}\n`);
    
    const adminUnread = await notificationModel.getUnreadByUserId(adminId);
    console.log(`✅ Admin tiene ${adminUnread.length} notificaciones no leídas`);
    adminUnread.forEach((notif, i) => {
      console.log(`\n${i + 1}. ${notif.titulo}`);
      console.log(`   Tipo: ${notif.tipo}, Color: ${notif.color}, Prioridad: ${notif.prioridad}`);
    });

    await pool.end();
    console.log('\n✅ Tests completados');
  } catch (error) {
    console.error('❌ Error en tests:', error);
    await pool.end();
    process.exit(1);
  }
}

testNotifications();
