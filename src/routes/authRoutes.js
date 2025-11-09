import { Router } from 'express';
import { postLogin, logout, checkSession } from '../controllers/authController.js';

const router = Router();

router.post('/login', postLogin);
router.post('/logout', logout);
router.get('/logout', logout);
router.get('/check', checkSession);

export default router;
