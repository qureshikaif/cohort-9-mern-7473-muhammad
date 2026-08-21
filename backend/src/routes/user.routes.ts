import { Router } from 'express';
import { me, updatePassword } from '../controllers/user.controller.js';
import { authenticate, validateBody } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { changePasswordSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(me));
router.patch('/me/password', validateBody(changePasswordSchema), asyncHandler(updatePassword));

export default router;
