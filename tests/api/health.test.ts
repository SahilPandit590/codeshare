import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../backend/src/app';
import * as dbModule from '../../backend/src/prisma/client';

describe('GET /api/health', () => {
  const app = createApp();

  it('returns 200 with status ok when database is healthy', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });

  it('returns 503 with status degraded when database is unreachable', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(false);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database).toBe('unreachable');
  });

  it('serves /ads.txt with HTTP 200 and text/plain content type', async () => {
    const res = await request(app).get('/ads.txt');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('google.com');
  });
});

