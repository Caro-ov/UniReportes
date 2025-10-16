import { Router } from 'express';
import * as loadingController from '../controllers/loadingController.js';

const router = Router();

// GET /api/loading/simulate - Simular tiempo de carga
router.get('/simulate', loadingController.simulateLoading);

// GET /api/loading/status - Obtener estado del sistema
router.get('/status', loadingController.getSystemStatus);

// GET /api/loading/progress - Obtener progreso de inicialización
router.get('/progress', loadingController.getInitializationProgress);

export default router;