import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load .env.local (from Neon CLI), .env from root or backend directory if present
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

if (!process.env.DIRECT_URL && process.env.DATABASE_URL_UNPOOLED) {
  process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/codeshare?schema=public'),
  DIRECT_URL: z.string().optional(),
  APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  MAX_PASTE_SIZE_BYTES: z.coerce.number().int().positive().default(524288), // 512 KB
  MAX_STORAGE_MB: z.coerce.number().int().positive().default(500), // 500 MB max active storage
  MAX_ACTIVE_PASTES: z.coerce.number().int().positive().default(2000), // 2000 max active pastes
  PASTE_EXPIRY_HOURS: z.coerce.number().positive().default(24),
  CLEANUP_INTERVAL_MINUTES: z.coerce.number().positive().default(60),
  RATE_LIMIT_CREATE_WINDOW_MS: z.coerce.number().int().positive().default(3600000), // 1 hour
  RATE_LIMIT_CREATE_MAX: z.coerce.number().int().positive().default(10), // 10 pastes/hr
  RATE_LIMIT_CREATE_DAILY_WINDOW_MS: z.coerce.number().int().positive().default(86400000), // 24 hours
  RATE_LIMIT_CREATE_DAILY_MAX: z.coerce.number().int().positive().default(30), // 30 pastes/day
  RATE_LIMIT_READ_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
  RATE_LIMIT_READ_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_DELETE_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
  RATE_LIMIT_DELETE_MAX: z.coerce.number().int().positive().default(20),
}).superRefine((values, ctx) => {
  if (values.NODE_ENV !== 'production') return;

  const isUnsafeProductionUrl = (value: string): boolean => {
    try {
      const url = new URL(value);
      return (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '::1' ||
        url.hostname.includes('YOUR-') ||
        url.hostname.includes('example.com')
      );
    } catch {
      return true;
    }
  };

  for (const key of ['DATABASE_URL', 'DIRECT_URL', 'APP_BASE_URL'] as const) {
    const value = values[key];
    if (value && isUnsafeProductionUrl(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${key} must point to a real production host`,
      });
    }
  }

  for (const origin of values.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean)) {
    if (isUnsafeProductionUrl(origin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN must contain only real production origins',
      });
    }
  }
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('CRITICAL: Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    // In test environment, provide fallback or exit
    if (process.env.NODE_ENV === 'test') {
      return envSchema.parse({});
    }
    process.exit(1);
  }
  return parsed.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
