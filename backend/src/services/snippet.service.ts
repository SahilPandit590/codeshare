import { CreateSnippetRequest, CreateSnippetResponse, GetSnippetResponse } from '@codeshare/shared';
import { env } from '../config/env';
import { DatabaseUnavailableError, AppError } from '../errors/appError';
import { pasteService } from './paste.service';

function shareUrl(shortCode: string): string {
  return new URL(`/${shortCode}`, `${env.PUBLIC_SHARE_ORIGIN.replace(/\/$/, '')}/`).toString();
}

export class SnippetService {
  async createSnippet(input: CreateSnippetRequest): Promise<CreateSnippetResponse> {
    try {
      const paste = await pasteService.createPaste({
        content: input.code,
        language: input.language,
      }, { generateShortCode: true });
      if (!paste.shortCode) {
        throw new DatabaseUnavailableError();
      }
      const url = shareUrl(paste.shortCode);

      return {
        ...paste,
        url,
        shareUrl: url,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseUnavailableError();
    }
  }

  async getSnippetById(id: string): Promise<GetSnippetResponse> {
    try {
      const paste = await pasteService.getPasteByPublicIdentifier(id);
      return {
        id: paste.id,
        code: paste.content,
        language: paste.language,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseUnavailableError();
    }
  }
}

export const snippetService = new SnippetService();
