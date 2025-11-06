import express from 'express';
import commentController from '../controllers/commentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas de comentarios
router.use(requireAuth);

// Rutas para comentarios
// GET /api/comments/report/:reportId - Obtener comentarios de un reporte
router.get('/report/:reportId', commentController.getByReportId);

// POST /api/comments/report/:reportId - Crear comentario en un reporte
router.post('/report/:reportId', commentController.create);

// DELETE /api/comments/:commentId - Eliminar un comentario
router.delete('/:commentId', commentController.delete);

export default router;