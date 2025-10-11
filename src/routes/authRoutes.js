import { Router } from 'express';
import { postLogin, logout } from '../controllers/authController.js';

const router = Router();

router.post('/login', postLogin);
router.post('/logout', logout);
router.get('/logout', logout);

export default router;
