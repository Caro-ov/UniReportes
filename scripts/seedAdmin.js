import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from '../src/config/db.js';

dotenv.config();

async function ensureDatabase() {
  // Asegurar que la tabla usuarios exista (por si el usuario no restauró el .sql aún)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario SERIAL PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      correo VARCHAR(200) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      rol VARCHAR(50) DEFAULT 'usuario'
    )
  `);
}

async function main() {
  try {
    await ensureDatabase();
    const email = 'admin@uni.local';
    const result = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = $1', [email]);
    if (result.rows.length > 0) {
      console.log('Admin ya existe');
      process.exit(0);
    }
    const hash = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4)',
      ['Administrador', email, hash, 'admin']
    );
    console.log('Usuario admin creado: admin@uni.local / Admin123!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
