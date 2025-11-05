import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// GET /api/categories - Obtener todas las categorías (acceso público para el formulario)
router.get('/', categoryController.getAllCategories);

// GET /api/categories/states - Obtener todos los estados (acceso público)
router.get('/states', categoryController.getAllStates);

// Todas las demás rutas requieren autenticación
router.use(requireAuth);

// GET /api/categories/stats - Obtener estadísticas (solo admin)
router.get('/stats', categoryController.getCategoriesStats);

// GET /api/categories/:id - Obtener una categoría específica
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Crear una nueva categoría (solo admin)
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Actualizar una categoría (solo admin)
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar una categoría (solo admin)
router.delete('/:id', categoryController.deleteCategory);

export default router;
