import { Router } from 'express';
import { create, getOne, list, remove, update } from '../controllers/note.controller.js';
import { share, unshare } from '../controllers/share.controller.js';
import { exportAll, importAll } from '../controllers/transfer.controller.js';
import { authenticate, validateBody } from '../middlewares/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator.js';
import { importSchema } from '../validators/transfer.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createNoteSchema), asyncHandler(create));
router.get('/', asyncHandler(list));

// must come before /:id or express treats "export" as an id
router.get('/export', asyncHandler(exportAll));
router.post('/import', validateBody(importSchema), asyncHandler(importAll));

router.get('/:id', asyncHandler(getOne));
router.patch('/:id', validateBody(updateNoteSchema), asyncHandler(update));
router.delete('/:id', asyncHandler(remove));
router.post('/:id/share', asyncHandler(share));
router.delete('/:id/share', asyncHandler(unshare));

export default router;
