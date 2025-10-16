import bcrypt from 'bcryptjs';
// Usar modelo de MySQL
import { findUserByEmail } from '../models/userModel.js';

export async function postLogin(req, res) {
  const { 'student-id': studentId, email, password } = req.body;
  
  // Validar que todos los campos estén presentes
  if (!studentId || !email || !password) {
    return res.redirect('/login.html?error=missing');
  }
  
  // Validar formato del código (exactamente 10 dígitos)
  const codigoRegex = /^\d{10}$/;
  if (!codigoRegex.test(studentId.trim())) {
    return res.redirect('/login.html?error=codigo_invalido');
  }
  
  // Validar formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.redirect('/login.html?error=invalid');
  }
  
  try {
    const user = await findUserByEmail(email.trim());
    
    if (!user || user.codigo !== studentId.trim()) {
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

    // Determinar el destino según el rol del usuario
    const destino = user.rol === 'admin' ? 'admin-dashboard' : 'dashboard';
    
    // Redireccionar a la pantalla de carga que luego va al dashboard apropiado
    return res.redirect(`/pantalla-carga.html?destino=${destino}`);
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
