import { Request, Response, NextFunction } from 'express';
import { pasteService } from '../services/paste.service';
import {
  createPasteSchema,
  getPasteParamSchema,
  deletePasteQuerySchema,
} from '../validators/paste.validator';
import { BadRequestError } from '../errors/appError';

export class PasteController {
  /**
   * POST /api/pastes
   */
  async createPaste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createPasteSchema.parse(req.body);
      const paste = await pasteService.createPaste(validatedData);

      // Prevent caching of responses containing deletion capabilities
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(201).json(paste);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pastes/:id
   */
  async getPaste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = getPasteParamSchema.parse(req.params);
      const paste = await pasteService.getPasteById(id);

      // Pastes are temporary and expire; prevent intermediary caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(200).json(paste);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/pastes/:id
   */
  async deletePaste(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = getPasteParamSchema.parse(req.params);

      // Token can come from x-delete-token header, query parameter, or JSON body
      const headerToken = req.headers['x-delete-token'];
      const rawToken =
        (typeof headerToken === 'string' && headerToken) ||
        (typeof req.query.token === 'string' && req.query.token) ||
        (req.body && typeof req.body.token === 'string' && req.body.token);

      if (!rawToken) {
        throw new BadRequestError('Deletion token is required to delete this paste');
      }

      const { token } = deletePasteQuerySchema.parse({ token: rawToken });
      const result = await pasteService.deletePaste(id, token);

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const pasteController = new PasteController();

