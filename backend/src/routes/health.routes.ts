import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../prisma/client';
import { HealthResponse } from '@codeshare/shared';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const isDbHealthy = await checkDatabaseHealth();

  const response: HealthResponse = {
    status: isDbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: isDbHealthy ? 'connected' : 'unreachable',
    version: '1.0.0',
  };

  const statusCode = isDbHealthy ? 200 : 503;
  res.status(statusCode).json(response);
});

export default router;

