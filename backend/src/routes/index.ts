import { Router } from 'express';
import authRoutes from './auth.routes.js';
import shareRoutes from './share.routes.js';
import noteRoutes from './note.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/shared', shareRoutes);
router.use('/notes', noteRoutes);
router.use('/users', userRoutes);

export default router;
