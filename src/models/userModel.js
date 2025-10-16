import pool from '../config/db.js';

/**
 * Buscar usuario por email
 */
export async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [email]);
  return rows[0] || null;
}

/**
 * Buscar usuario por ID
 */
export async function findUserById(userId) {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1', [userId]);
  return rows[0] || null;
}

/**
 * Buscar usuario por código de estudiante
 */
export async function findUserByStudentCode(codigo) {
  const [rows] = await pool.execute('SELECT * FROM usuarios WHERE codigo_estudiante = ? LIMIT 1', [codigo]);
  return rows[0] || null;
}

/**
 * Crear un nuevo usuario
 */
export async function createUser({ nombre, correo, codigo_estudiante, contrasenaHash, rol = 'usuario' }) {
  const [result] = await pool.execute(
    'INSERT INTO usuarios (nombre, correo, codigo_estudiante, contrasena, rol) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, codigo_estudiante, contrasenaHash, rol]
  );
  return result.insertId;
}

/**
 * Obtener todos los usuarios con paginación
 */
export async function getAllUsers(limit = 50, offset = 0) {
  const [rows] = await pool.execute(
    `SELECT 
       id_usuario, nombre, correo, codigo_estudiante, rol, 
       fecha_creacion, fecha_actualizacion
     FROM usuarios 
     ORDER BY fecha_creacion DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
}

/**
 * Actualizar información de usuario
 */
export async function updateUser(userId, updateData) {
  const fields = [];
  const values = [];

  // Construir query dinámicamente
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && key !== 'id_usuario') {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    }
  });

  if (fields.length === 0) {
    return false;
  }

  fields.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  values.push(userId);

  const [result] = await pool.execute(
    `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`,
    values
  );

  return result.affectedRows > 0;
}

/**
 * Eliminar usuario
 */
export async function deleteUser(userId) {
  const [result] = await pool.execute(
    'DELETE FROM usuarios WHERE id_usuario = ?',
    [userId]
  );
  return result.affectedRows > 0;
}

/**
 * Obtener estadísticas de usuarios
 */
export async function getUsersStats() {
  const [stats] = await pool.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN rol = 'usuario' THEN 1 ELSE 0 END) as usuarios,
      SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as administradores,
      SUM(CASE WHEN rol = 'monitor' THEN 1 ELSE 0 END) as monitores,
      SUM(CASE WHEN DATE(fecha_creacion) = CURDATE() THEN 1 ELSE 0 END) as nuevos_hoy
    FROM usuarios
  `);
  
  return stats[0] || {};
}

/**
 * Buscar usuarios por filtros
 */
export async function getUsersFiltered(filters = {}) {
  let query = `
    SELECT 
      id_usuario, nombre, correo, codigo_estudiante, rol, 
      fecha_creacion, fecha_actualizacion
    FROM usuarios 
    WHERE 1=1
  `;
  
  const values = [];

  if (filters.rol) {
    query += ' AND rol = ?';
    values.push(filters.rol);
  }

  if (filters.buscar) {
    query += ' AND (nombre LIKE ? OR correo LIKE ? OR codigo_estudiante LIKE ?)';
    const searchTerm = `%${filters.buscar}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY fecha_creacion DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    values.push(parseInt(filters.limit));
  }

  const [rows] = await pool.execute(query, values);
  return rows;
}

/**
 * Verificar si un email ya existe
 */
export async function emailExists(email, excludeUserId = null) {
  let query = 'SELECT COUNT(*) as count FROM usuarios WHERE correo = ?';
  const values = [email];
  
  if (excludeUserId) {
    query += ' AND id_usuario != ?';
    values.push(excludeUserId);
  }
  
  const [rows] = await pool.execute(query, values);
  return rows[0].count > 0;
}

/**
 * Verificar si un código de estudiante ya existe
 */
export async function studentCodeExists(codigo, excludeUserId = null) {
  let query = 'SELECT COUNT(*) as count FROM usuarios WHERE codigo_estudiante = ?';
  const values = [codigo];
  
  if (excludeUserId) {
    query += ' AND id_usuario != ?';
    values.push(excludeUserId);
  }
  
  const [rows] = await pool.execute(query, values);
  return rows[0].count > 0;
}

export default {
  findUserByEmail,
  findUserById,
  findUserByStudentCode,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUsersStats,
  getUsersFiltered,
  emailExists,
  studentCodeExists
};
