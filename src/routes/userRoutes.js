import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /api/users/profile - Obtener perfil del usuario actual
router.get('/profile', userController.getCurrentUserProfile);

// GET /api/users/search - Buscar usuarios (solo admin)
router.get('/search', userController.searchUsers);

// GET /api/users/stats - Obtener estadísticas (solo admin)
router.get('/stats', userController.getUsersStats);

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Obtener un usuario específico
router.get('/:id', userController.getUserById);

// POST /api/users - Crear un nuevo usuario (solo admin)
router.post('/', userController.createUser);

// PUT /api/users/:id - Actualizar un usuario
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Eliminar un usuario (solo admin)
router.delete('/:id', userController.deleteUser);

export default router;
