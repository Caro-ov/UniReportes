import express from 'express';
import * as objectController from '../controllers/objectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas para consulta (necesarias para el formulario)
router.get('/', objectController.getAllObjects);
router.get('/categoria/:categoryId', objectController.getObjectsByCategory);
router.get('/:id', objectController.getObjectById);

// Aplicar middleware de autenticación solo a rutas de modificación
router.use(requireAuth);
router.post('/', objectController.createObject);
router.put('/:id', objectController.updateObject);
router.delete('/:id', objectController.deleteObject);

export default router;