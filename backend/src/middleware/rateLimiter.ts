import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { Request, Response } from 'express';

export const createPasteHourlyLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_CREATE_WINDOW_MS,
  max: env.RATE_LIMIT_CREATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production' && process.env.SKIP_RATE_LIMIT === 'true',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many pastes created from this IP. Please try again later.',
      },
    });
  },
});

export const createPasteDailyLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_CREATE_DAILY_WINDOW_MS,
  max: env.RATE_LIMIT_CREATE_DAILY_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production' && process.env.SKIP_RATE_LIMIT === 'true',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Daily paste creation limit exceeded for this IP. Please try again tomorrow.',
      },
    });
  },
});

export const readPasteLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_READ_WINDOW_MS,
  max: env.RATE_LIMIT_READ_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production' && process.env.SKIP_RATE_LIMIT === 'true',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again later.',
      },
    });
  },
});

export const deletePasteLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_DELETE_WINDOW_MS,
  max: env.RATE_LIMIT_DELETE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production' && process.env.SKIP_RATE_LIMIT === 'true',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many deletion attempts from this IP. Please try again later.',
      },
    });
  },
});
