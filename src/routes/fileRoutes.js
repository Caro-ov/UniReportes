import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as fileController from '../controllers/fileController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/files/:filename - Servir un archivo específico
router.get('/:filename', fileController.serveFile);

// GET /api/files/report/:reportId - Obtener archivos de un reporte
router.get('/report/:reportId', fileController.getReportFiles);

// DELETE /api/files/delete/:fileId - Eliminar un archivo
router.delete('/delete/:fileId', fileController.deleteFile);

export default router;