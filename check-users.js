import pool from './src/config/db.js';

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    // Obtener todos los usuarios
    const [rows] = await pool.execute('SELECT * FROM usuarios ORDER BY id_usuario');
    
    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
    console.log(`Total usuarios encontrados: ${rows.length}`);
    console.log('');
    
    if (rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      rows.forEach((user, index) => {
        console.log(`${index + 1}. Usuario ID: ${user.id_usuario}`);
        console.log(`   Nombre: ${user.nombre}`);
        console.log(`   Correo: ${user.correo}`);
        console.log(`   Código: ${user.codigo}`);
        console.log(`   Rol: ${user.rol}`);
        console.log(`   Fecha: ${user.fecha_creacion}`);
        console.log('   ---');
      });
    }
    
    // Verificar estructura de la tabla
    console.log('\n=== ESTRUCTURA DE LA TABLA ===');
    const [columns] = await pool.execute('DESCRIBE usuarios');
    columns.forEach(col => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
    process.exit(1);
  }
}

checkUsers();