import { Router } from 'express';
import { snippetController } from '../controllers/snippet.controller';
import {
  createPasteHourlyLimiter,
  createPasteDailyLimiter,
  readPasteLimiter,
} from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/',
  createPasteHourlyLimiter,
  createPasteDailyLimiter,
  snippetController.createSnippet.bind(snippetController),
);

router.get('/:id', readPasteLimiter, snippetController.getSnippet.bind(snippetController));

export default router;
