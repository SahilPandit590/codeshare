import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '@codeshare/shared';
import { env } from '../config/env';

export const createSnippetSchema = z.object({
  code: z
    .string({
      required_error: 'Code is required',
      invalid_type_error: 'Code must be a string',
    })
    .refine((value) => value.trim().length > 0, {
      message: 'Code cannot be empty or whitespace-only',
    })
    .refine((value) => Buffer.byteLength(value, 'utf8') <= env.MAX_PASTE_SIZE_BYTES, {
      message: `Code exceeds maximum allowed size of ${env.MAX_PASTE_SIZE_BYTES} bytes`,
    }),
  language: z.enum(SUPPORTED_LANGUAGES, {
    errorMap: () => ({
      message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
    }),
  }).optional().default('text'),
});

export const snippetIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Snippet ID is required' })
    .min(6, 'Snippet ID is too short')
    .max(32, 'Snippet ID is too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Snippet ID contains invalid characters'),
});
