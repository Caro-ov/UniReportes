import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middleware/uploadMiddleware.js';
import * as reportController from '../controllers/reportController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/reports - Obtener todos los reportes
router.get('/', reportController.getAllReports);

// GET /api/reports/my - Obtener reportes del usuario actual
router.get('/my', reportController.getUserReports);

// GET /api/reports/search - Buscar reportes con filtros
router.get('/search', reportController.searchReports);

// GET /api/reports/stats - Obtener estadísticas (solo admin)
router.get('/stats', reportController.getReportsStats);

// GET /api/reports/:id - Obtener un reporte específico
router.get('/:id', reportController.getReportById);

// GET /api/reports/:id/historial - Obtener historial de cambios de un reporte
router.get('/:id/historial', reportController.getReportHistorial);

// POST /api/reports - Crear un nuevo reporte (con múltiples archivos opcionales)
router.post('/', uploadMultiple, handleMulterError, reportController.createReport);

// PUT /api/reports/:id - Actualizar un reporte (con archivos opcionales)
router.put('/:id', uploadMultiple, handleMulterError, reportController.updateReport);

// PATCH /api/reports/:id/status - Actualizar solo el estado (admin)
router.patch('/:id/status', reportController.updateReportStatus);

// DELETE /api/reports/:id - Eliminar un reporte
router.delete('/:id', reportController.deleteReport);

export default router;
