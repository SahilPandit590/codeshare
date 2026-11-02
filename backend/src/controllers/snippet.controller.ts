import { Request, Response, NextFunction } from 'express';
import { snippetService } from '../services/snippet.service';
import { createSnippetSchema, snippetIdParamSchema } from '../validators/snippet.validator';
import { NotFoundError } from '../errors/appError';

export class SnippetController {
  async createSnippet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createSnippetSchema.parse(req.body);
      const snippet = await snippetService.createSnippet(input);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(201).json(snippet);
    } catch (error) {
      next(error);
    }
  }

  async getSnippet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = snippetIdParamSchema.safeParse(req.params);
      // Treat malformed public IDs as not found. This avoids revealing details
      // about the identifier format while still validating before querying.
      if (!parsed.success) {
        throw new NotFoundError('Snippet not found');
      }

      const snippet = await snippetService.getSnippetById(parsed.data.id);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.status(200).json(snippet);
    } catch (error) {
      next(error);
    }
  }
}

export const snippetController = new SnippetController();
