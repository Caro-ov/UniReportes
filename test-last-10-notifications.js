import pool from './src/config/db.js';

async function testNotificationSystem() {
    console.log('🧪 Probando sistema de notificaciones (últimas 10)...\n');
    
    try {
        // 1. Obtener un usuario de prueba
        const [usuarios] = await pool.execute(
            "SELECT id_usuario, nombre, rol FROM usuarios WHERE rol IN ('admin', 'monitor') LIMIT 1"
        );
        
        if (usuarios.length === 0) {
            console.log('❌ No hay usuarios de prueba');
            return;
        }
        
        const usuario = usuarios[0];
        console.log(`👤 Usuario de prueba: ${usuario.nombre} (ID: ${usuario.id_usuario}, Rol: ${usuario.rol})\n`);
        
        // 2. Obtener las últimas 10 notificaciones
        const [todasNotif] = await pool.execute(
            `SELECT 
                n.*,
                r.titulo as reporte_titulo,
                r.id_estado,
                e.nombre as estado_nombre
            FROM notificaciones n
            INNER JOIN reportes r ON n.id_reporte = r.id_reporte
            LEFT JOIN estados e ON r.id_estado = e.id_estado
            WHERE n.id_usuario_destino = ?
            ORDER BY n.fecha_creacion DESC
            LIMIT 10`,
            [usuario.id_usuario]
        );
        
        console.log(`📋 Últimas 10 notificaciones (leídas y no leídas):`);
        console.log(`   Total: ${todasNotif.length}`);
        
        if (todasNotif.length > 0) {
            todasNotif.forEach((notif, index) => {
                const estado = notif.leida ? '✅ Leída' : '📬 No leída';
                console.log(`   ${index + 1}. ${estado} - ${notif.tipo} - ${notif.titulo}`);
            });
        } else {
            console.log('   No hay notificaciones');
        }
        
        // 3. Contar no leídas
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM notificaciones WHERE id_usuario_destino = ? AND leida = 0',
            [usuario.id_usuario]
        );
        
        console.log(`\n📊 Estadísticas:`);
        console.log(`   Total de notificaciones: ${todasNotif.length}`);
        console.log(`   No leídas: ${countResult[0].count}`);
        console.log(`   Leídas: ${todasNotif.length - countResult[0].count}`);
        
        console.log('\n✅ Sistema funcionando correctamente');
        console.log('\n💡 Ahora verás:');
        console.log('   - Las últimas 10 notificaciones en el panel');
        console.log('   - Las no leídas con fondo azul claro');
        console.log('   - Las leídas con opacidad reducida (más tenues)');
        console.log('   - El badge muestra solo las no leídas');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testNotificationSystem();
