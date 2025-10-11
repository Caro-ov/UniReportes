import pool from './src/config/db.js';

async function testConnection() {
  try {
    console.log('Probando conexión a PostgreSQL...');
    const result = await pool.query('SELECT 1 AS test, NOW() AS timestamp');
    console.log('✅ Conexión exitosa:', result.rows[0]);
    
    console.log('Verificando tabla usuarios...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabla usuarios no existe, creándola...');
      await pool.query(`
        CREATE TABLE usuarios (
          id_usuario SERIAL PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          correo VARCHAR(200) NOT NULL UNIQUE,
          contrasena VARCHAR(255) NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          rol VARCHAR(50) DEFAULT 'usuario'
        )
      `);
      console.log('✅ Tabla usuarios creada');
    } else {
      console.log('✅ Tabla usuarios existe');
    }
    
    const users = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    console.log('👥 Usuarios en la base:', users.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();