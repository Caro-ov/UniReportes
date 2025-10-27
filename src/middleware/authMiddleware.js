export function requireAuth(req, res, next) {
  // Configurar headers de seguridad para prevenir caché en páginas protegidas
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  if (req.session && req.session.user) return next();
  
  // Para peticiones API, devolver JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }
  
  // Para páginas web, redirigir al login
  return res.redirect('/login.html');
}

export function attachUserInViews(req, _res, next) {
  // Exponer el usuario a las vistas estáticas si se necesitara en el futuro
  req.currentUser = req.session?.user || null;
  next();
}
