import { Router } from 'express';
import { login, logout, refresh, register } from '../controllers/auth.controller.js';
import { authenticate, validateBody } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));
router.post('/refresh', validateBody(refreshSchema), asyncHandler(refresh));
router.post('/logout', authenticate, logout);

export default router;
