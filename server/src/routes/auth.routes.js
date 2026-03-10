import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.post('/register', register, validate);
router.post('/login', login, validate);
router.get('/me', protect, getMe);

export default router;
