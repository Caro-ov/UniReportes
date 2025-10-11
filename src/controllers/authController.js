import bcrypt from 'bcryptjs';
// Usar modelo de MySQL
import { findUserByEmail } from '../models/userModel.js';

export async function postLogin(req, res) {
  const { 'student-id': studentId, email, password } = req.body;
  
  if (!studentId || !email || !password) {
    return res.redirect('/login.html?error=missing');
  }
  
  try {
    const user = await findUserByEmail(email);
    
    if (!user || user.codigo_estudiante !== studentId) {
      return res.redirect('/login.html?error=invalid');
    }

    const ok = await bcrypt.compare(password, user.contrasena);
    
    if (!ok) {
      return res.redirect('/login.html?error=invalid');
    }

    req.session.user = {
      id: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    };

    return res.redirect('/dashboard.html');
  } catch (err) {
    console.error('Error en login:', err);
    return res.redirect('/login.html?error=server');
  }
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
}
