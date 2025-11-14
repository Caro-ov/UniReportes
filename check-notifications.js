import pool from './src/config/db.js';

async function checkNotifications() {
  try {
    console.log('🔍 Verificando tabla de notificaciones...\n');

    // Verificar si la tabla existe
    const [tables] = await pool.execute("SHOW TABLES LIKE 'notificaciones'");
    
    if (tables.length === 0) {
      console.log('❌ La tabla "notificaciones" NO EXISTE en la base de datos');
      console.log('📋 Debes ejecutar el archivo SQL para crear la tabla y los triggers\n');
      process.exit(1);
    }

    console.log('✅ La tabla "notificaciones" existe\n');

    // Obtener estructura de la tabla
    const [structure] = await pool.execute('DESCRIBE notificaciones');
    console.log('=== ESTRUCTURA DE LA TABLA ===');
    structure.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'NO' ? 'NOT NULL' : 'NULL'})`);
    });

    // Contar notificaciones
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM notificaciones');
    console.log(`\n📊 Total de notificaciones: ${count[0].total}\n`);

    if (count[0].total > 0) {
      // Mostrar últimas notificaciones
      const [notifications] = await pool.execute(
        `SELECT n.*, u.nombre as usuario_nombre 
         FROM notificaciones n
         LEFT JOIN usuarios u ON n.id_usuario_destino = u.id_usuario
         ORDER BY n.fecha_creacion DESC
         LIMIT 10`
      );

      console.log('=== ÚLTIMAS 10 NOTIFICACIONES ===');
      notifications.forEach((notif, index) => {
        console.log(`\n${index + 1}. ID: ${notif.id_notificacion}`);
        console.log(`   Para: ${notif.usuario_nombre} (ID: ${notif.id_usuario_destino})`);
        console.log(`   Tipo: ${notif.tipo}`);
        console.log(`   Título: ${notif.titulo}`);
        console.log(`   Mensaje: ${notif.mensaje}`);
        console.log(`   Leída: ${notif.leida ? 'Sí' : 'No'}`);
        console.log(`   Prioridad: ${notif.prioridad}`);
        console.log(`   Color: ${notif.color}`);
        console.log(`   Fecha: ${notif.fecha_creacion}`);
        console.log('   ---');
      });
    }

    // Verificar triggers
    console.log('\n=== TRIGGERS INSTALADOS ===');
    const [triggers] = await pool.execute("SHOW TRIGGERS WHERE `Table` = 'reportes' OR `Table` = 'comentarios' OR `Table` = 'historial_cambios'");
    
    if (triggers.length === 0) {
      console.log('❌ No hay triggers instalados');
      console.log('📋 Debes ejecutar el archivo SQL para crear los triggers\n');
    } else {
      triggers.forEach(trigger => {
        console.log(`✅ ${trigger.Trigger} (${trigger.Event} on ${trigger.Table})`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNotifications();
