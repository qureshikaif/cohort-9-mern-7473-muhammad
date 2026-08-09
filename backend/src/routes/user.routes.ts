import { Router } from 'express';
import { me } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/me', authenticate, asyncHandler(me));

export default router;
