import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authMiddleware, getProfile);

export default router;
