import pool from './src/config/db.js';

async function testEditNotification() {
    console.log('🧪 Probando sistema de notificaciones de edición...\n');
    
    try {
        // 1. Verificar que el trigger NO existe
        const [triggers] = await pool.execute(
            "SHOW TRIGGERS FROM datos_unireportes WHERE `Trigger` = 'notif_reporte_modificado'"
        );
        
        if (triggers.length > 0) {
            console.log('❌ El trigger notif_reporte_modificado todavía existe');
            console.log('   Elimínalo con: DROP TRIGGER IF EXISTS notif_reporte_modificado;');
        } else {
            console.log('✅ Trigger notif_reporte_modificado eliminado correctamente');
        }
        
        // 2. Verificar usuarios admin
        const [admins] = await pool.execute(
            "SELECT id_usuario, nombre, rol FROM usuarios WHERE rol = 'admin'"
        );
        console.log(`\n📋 Administradores encontrados: ${admins.length}`);
        admins.forEach(admin => {
            console.log(`   - ${admin.nombre} (ID: ${admin.id_usuario})`);
        });
        
        // 3. Verificar un reporte de prueba
        const [reportes] = await pool.execute(
            "SELECT id_reporte, titulo, id_usuario FROM reportes LIMIT 1"
        );
        
        if (reportes.length > 0) {
            const reporte = reportes[0];
            console.log(`\n📄 Reporte de prueba:`);
            console.log(`   ID: ${reporte.id_reporte}`);
            console.log(`   Título: ${reporte.titulo}`);
            console.log(`   Creador ID: ${reporte.id_usuario}`);
            
            console.log('\n💡 Para probar, edita este reporte desde la aplicación.');
            console.log('   Deberías recibir notificaciones en:');
            console.log(`   - Creador del reporte (ID: ${reporte.id_usuario}) si no es quien edita`);
            admins.forEach(admin => {
                console.log(`   - Admin: ${admin.nombre} (ID: ${admin.id_usuario}) si no es quien edita`);
            });
        }
        
        // 4. Contar notificaciones actuales
        const [notifCount] = await pool.execute(
            "SELECT COUNT(*) as total FROM notificaciones WHERE tipo = 'edicion'"
        );
        console.log(`\n📊 Notificaciones de edición actuales: ${notifCount[0].total}`);
        
        console.log('\n✅ Sistema listo para pruebas');
        console.log('\n📝 Pasos para probar:');
        console.log('   1. Inicia sesión como monitor o admin');
        console.log('   2. Edita un reporte existente');
        console.log('   3. Verifica que aparecen notificaciones con campanita 🔔');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testEditNotification();
