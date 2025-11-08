import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadMultiple, handleMulterError } from '../middleware/uploadMiddleware.js';
import * as fileController from '../controllers/fileController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/files/:filename - Servir un archivo específico
router.get('/:filename', fileController.serveFile);

// GET /api/files/report/:reportId - Obtener archivos de un reporte
router.get('/report/:reportId', fileController.getReportFiles);

// POST /api/files/report/:reportId - Agregar archivos a un reporte existente
router.post('/report/:reportId', uploadMultiple, handleMulterError, fileController.addFilesToReport);

// DELETE /api/files/:fileId - Eliminar un archivo
router.delete('/:fileId', fileController.deleteFile);

export default router;