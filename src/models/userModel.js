import pool from '../config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [email]);
  return rows[0] || null;
}

export async function createUser({ nombre, correo, codigo_estudiante, contrasenaHash, rol = 'usuario' }) {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, correo, codigo_estudiante, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, codigo_estudiante, contrasenaHash, rol]
  );
  return result.insertId;
}
