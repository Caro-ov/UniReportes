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

// Páginas protegidas (requieren sesión)
const protectedPages = [
  // 'pantalla-carga.html', // DESHABILITADO - Causaba interferencias
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
  'crear-usuario.html',
  'explorar-reportes.html'
];

adminPages.forEach((file) => {
  router.get('/' + file, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', file));
  });
});

export default router;