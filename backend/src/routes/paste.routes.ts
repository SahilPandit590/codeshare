import { Router } from 'express';
import { pasteController } from '../controllers/paste.controller';
import {
  createPasteHourlyLimiter,
  createPasteDailyLimiter,
  readPasteLimiter,
  deletePasteLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// POST /api/pastes - Create new paste (guarded by hourly and daily rate limiters)
router.post(
  '/',
  createPasteHourlyLimiter,
  createPasteDailyLimiter,
  pasteController.createPaste.bind(pasteController)
);

// GET /api/pastes/:id - View paste
router.get('/:id', readPasteLimiter, pasteController.getPaste.bind(pasteController));

// DELETE /api/pastes/:id - Delete paste early
router.delete('/:id', deletePasteLimiter, pasteController.deletePaste.bind(pasteController));

export default router;
