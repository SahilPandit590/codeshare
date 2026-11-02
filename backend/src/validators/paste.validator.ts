import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '@codeshare/shared';
import { env } from '../config/env';

export const createPasteSchema = z.object({
  content: z
    .string({
      required_error: 'Content is required',
      invalid_type_error: 'Content must be a string',
    })
    .refine((val) => val.trim().length > 0, {
      message: 'Content cannot be empty or whitespace-only',
    })
    .refine((val) => Buffer.byteLength(val, 'utf8') <= env.MAX_PASTE_SIZE_BYTES, {
      message: `Content exceeds maximum allowed size of ${env.MAX_PASTE_SIZE_BYTES} bytes`,
    }),
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    }),
  }).optional().default('text'),
});

export const getPasteParamSchema = z.object({
  id: z
    .string({
      required_error: 'Paste ID is required',
    })
    .min(6, 'Paste ID is too short')
    .max(32, 'Paste ID is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Paste ID contains invalid characters'),
});

export const deletePasteQuerySchema = z.object({
  token: z
    .string({
      required_error: 'Deletion token is required',
    })
    .min(16, 'Deletion token is too short')
    .max(128, 'Deletion token is too long'),
});

