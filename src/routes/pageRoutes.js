import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
// `pageRoutes.js` está en src/routes/, queremos el directorio raíz del proyecto
// subiendo tres niveles desde este archivo: src/routes -> src -> (project root)
const __dirname = path.dirname(path.dirname(path.dirname(__filename)));

const router = Router();

// Páginas públicas
router.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Página de prueba temporal
router.get('/test-api.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-api.html'));
});

// Páginas protegidas (requieren sesión)
const protectedPages = [
  'pantalla-carga.html', // Solo para transición login -> dashboard
  'dashboard.html',
  'perfil.html',
  'crear-reporte.html',
  'mis-reportes.html',
  'detalle-reporte.html',
  'ayuda.html'
];

protectedPages.forEach((file) => {
  router.get('/' + file, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', file));
  });
});

// Páginas de administrador (también requieren sesión)
const adminPages = [
  'admin-dashboard.html',
  'admin-settings.html',
  'detalle-reporte-admin.html',
  'crear-usuario.html',
  'explorar-reportes.html',
  'ver-usuarios.html'
];

adminPages.forEach((file) => {
  router.get('/' + file, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', file));
  });
});

// Ruta para archivos parciales del SPA
router.get('/partials/:filename', requireAuth, (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'views', 'partials', filename));
});

export default router;