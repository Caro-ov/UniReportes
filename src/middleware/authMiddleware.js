export function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  // Redirige al login si no hay sesión
  return res.redirect('/login.html');
}

export function attachUserInViews(req, _res, next) {
  // Exponer el usuario a las vistas estáticas si se necesitara en el futuro
  req.currentUser = req.session?.user || null;
  next();
}
