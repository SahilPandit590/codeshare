import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/appError';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Redact any potentially sensitive parameters in logging
  const safePath = req.path;
  const method = req.method;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error(`[AppError] ${method} ${safePath} - ${err.message}`);
    }
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: formattedErrors,
      },
    });
    return;
  }

  // Handle syntax errors from body-parser (e.g., malformed JSON)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
    return;
  }

  // Payload too large from body-parser
  if (err && typeof err === 'object' && 'type' in err && (err as { type: string }).type === 'entity.too.large') {
    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: `Request entity exceeds size limit of ${env.MAX_PASTE_SIZE_BYTES} bytes`,
      },
    });
    return;
  }

  // Generic internal server error: Never leak internal error message, database error or stack trace in production
  console.error(`[UnhandledError] ${method} ${safePath}:`, err instanceof Error ? err.stack || err.message : err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}
