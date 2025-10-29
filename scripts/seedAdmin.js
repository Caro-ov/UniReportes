import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

dotenv.config();

async function ensureDatabase() {
  // Asegurar que la tabla usuarios exista (por si el usuario no restauró el .sql aún)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INT PRIMARY KEY AUTO_INCREMENT,
      nombre VARCHAR(150) NOT NULL,
      correo VARCHAR(200) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL,
      codigo VARCHAR(50),
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      rol VARCHAR(50) DEFAULT 'usuario'
    )
  `);
}

async function main() {
  try {
    await ensureDatabase();
    const email = 'admin@uni.local';
    const [result] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [email]);
    if (result.length > 0) {
      console.log('Admin ya existe');
      process.exit(0);
    }
    const hash = await bcrypt.hash('admin123', 10);
    await pool.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol, codigo) VALUES (?, ?, ?, ?, ?)',
      ['Administrador Principal', email, hash, 'admin', '2024000001']
    );
    console.log('Usuario admin creado: admin@uni.local / admin123');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
