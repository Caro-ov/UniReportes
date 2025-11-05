import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/recent-reports - Obtener reportes recientes
router.get('/recent-reports', dashboardController.getRecentReports);

// GET /api/dashboard/activity - Obtener resumen de actividad
router.get('/activity', dashboardController.getActivitySummary);

// GET /api/dashboard/category-stats - Obtener estadísticas por categoría (admin)
router.get('/category-stats', dashboardController.getCategoryStats);

// GET /api/dashboard/trends - Obtener gráfico de tendencias (admin)
router.get('/trends', dashboardController.getTrendsChart);

// GET /api/dashboard/admin-cards - Obtener estadísticas para tarjetas del admin dashboard
router.get('/admin-cards', dashboardController.getAdminCardStats);

export default router;