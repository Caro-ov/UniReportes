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
  res.sendFile(path.join(__dirname, 'index.html'));
});
router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
router.get('/pantalla-carga.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pantalla-carga.html'));
});

// Páginas protegidas (requieren sesión)
const protectedPages = [
  'dashboard.html',
  'perfil.html',
  'crear-reporte.html',
  'mis-reportes.html',
  'detalle-reporte.html',
  'ayuda.html'
];

protectedPages.forEach((file) => {
  router.get('/' + file, requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

export default router;