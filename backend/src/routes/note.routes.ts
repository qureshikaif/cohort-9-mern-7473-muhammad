import { Router } from 'express';
import { create, getOne, list, remove, update } from '../controllers/note.controller.js';
import { share, unshare } from '../controllers/share.controller.js';
import { authenticate, validateBody } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createNoteSchema), asyncHandler(create));
router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(getOne));
router.patch('/:id', validateBody(updateNoteSchema), asyncHandler(update));
router.delete('/:id', asyncHandler(remove));
router.post('/:id/share', asyncHandler(share));
router.delete('/:id/share', asyncHandler(unshare));

export default router;
