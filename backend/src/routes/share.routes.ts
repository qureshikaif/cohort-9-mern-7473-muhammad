import { Router } from 'express';
import { readShared, writeShared } from '../controllers/share.controller.js';
import { validateBody } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sharedUpdateSchema } from '../validators/share.validator.js';

const router = Router();

router.get('/:token', asyncHandler(readShared));
router.patch('/:token', validateBody(sharedUpdateSchema), asyncHandler(writeShared));

export default router;
