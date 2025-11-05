import express from 'express';
import UbicacionController from '../controllers/ubicacionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (GET) - no requieren autenticación para formularios
router.get('/', UbicacionController.getAllUbicaciones);
router.get('/:idUbicacion', UbicacionController.getUbicacionById);
router.get('/:idUbicacion/salones', UbicacionController.getSalonesByUbicacion);

// Aplicar autenticación a rutas que la requieren
router.use(requireAuth);

// Aquí se pueden agregar rutas protegidas en el futuro
// router.post('/', UbicacionController.createUbicacion);
// router.put('/:id', UbicacionController.updateUbicacion);
// router.delete('/:id', UbicacionController.deleteUbicacion);

export default router;