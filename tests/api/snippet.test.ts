import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../backend/src/app';
import { prisma } from '../../backend/src/prisma/client';
import { env } from '../../backend/src/config/env';

vi.mock('../../backend/src/prisma/client', () => ({
  prisma: {
    paste: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));

describe('Snippet API Endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SKIP_RATE_LIMIT = 'true';
    (prisma.$queryRaw as any).mockResolvedValue([]);
  });

  it('creates a snippet with a secure six-character share URL and persists the submitted code', async () => {
    (prisma.paste.create as any).mockResolvedValue({});

    const response = await request(app)
      .post('/api/snippets')
      .send({ code: 'const shared = true;', language: 'typescript' });

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(response.body.shortCode).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(response.body.url).toBe(new URL(`/${response.body.shortCode}`, env.PUBLIC_SHARE_ORIGIN).toString());
    expect(response.body.shareUrl).toBe(response.body.url);
    expect(response.body.deleteToken).toBeDefined();
    expect(response.body.deleteTokenHash).toBeUndefined();

    const createArgs = (prisma.paste.create as any).mock.calls[0][0];
    expect(createArgs.data.id).toBe(response.body.id);
    expect(createArgs.data.shortCode).toBe(response.body.shortCode);
    expect(createArgs.data.content).toBe('const shared = true;');
    expect(createArgs.data.language).toBe('typescript');
  });

  it('generates different IDs and short codes for different submissions', async () => {
    (prisma.paste.create as any).mockResolvedValue({});

    const first = await request(app).post('/api/snippets').send({ code: 'one' });
    const second = await request(app).post('/api/snippets').send({ code: 'two' });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.id).not.toBe(second.body.id);
    expect(first.body.shortCode).not.toBe(second.body.shortCode);
  });

  it('retries safely when the database reports an identifier collision', async () => {
    const collision = Object.assign(new Error('duplicate key'), { code: 'P2002' });
    (prisma.paste.create as any)
      .mockRejectedValueOnce(collision)
      .mockResolvedValueOnce({});

    const response = await request(app).post('/api/snippets').send({ code: 'retry me' });

    expect(response.status).toBe(201);
    expect(prisma.paste.create).toHaveBeenCalledTimes(2);
    expect((prisma.paste.create as any).mock.calls[0][0].data.id)
      .not.toBe((prisma.paste.create as any).mock.calls[1][0].data.id);
    expect((prisma.paste.create as any).mock.calls[0][0].data.shortCode)
      .not.toBe((prisma.paste.create as any).mock.calls[1][0].data.shortCode);
  });

  it('retrieves the exact code, language, and creation timestamp', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    (prisma.paste.findUnique as any).mockResolvedValue({
      id: 'snippet-read-id',
      content: 'print("exact")\n',
      language: 'python',
      createdAt,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const response = await request(app).get('/api/snippets/snippet-read-id');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'snippet-read-id',
      code: 'print("exact")\n',
      language: 'python',
      createdAt: createdAt.toISOString(),
      expiresAt: expect.any(String),
    });
  });

  it('retrieves a snippet by its six-character short code', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    (prisma.paste.findUnique as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'snippet-internal-id',
        shortCode: 'abc6aD',
        content: 'const short = true;',
        language: 'javascript',
        createdAt,
        expiresAt: new Date(Date.now() + 60_000),
      });

    const response = await request(app).get('/api/snippets/abc6aD');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('snippet-internal-id');
    expect(response.body.code).toBe('const short = true;');
    expect((prisma.paste.findUnique as any).mock.calls).toEqual([
      [{ where: { id: 'abc6aD' } }],
      [{ where: { shortCode: 'abc6aD' } }],
    ]);
  });

  it('returns 404 for missing and malformed IDs without exposing identifier details', async () => {
    (prisma.paste.findUnique as any).mockResolvedValue(null);

    const missing = await request(app).get('/api/snippets/missing-id');
    const malformed = await request(app).get('/api/snippets/not%21valid');

    expect(missing.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(malformed.body.error.code).toBe('NOT_FOUND');
    expect(prisma.paste.findUnique).toHaveBeenCalledTimes(2);
  });

  it('returns 410 for an expired snippet', async () => {
    (prisma.paste.findUnique as any).mockResolvedValue({
      id: 'expired-snippet-id',
      content: 'expired content',
      language: 'text',
      createdAt: new Date(Date.now() - 86_400_000),
      expiresAt: new Date(Date.now() - 1_000),
    });

    const response = await request(app).get('/api/snippets/expired-snippet-id');

    expect(response.status).toBe(410);
    expect(response.body.error.code).toBe('PASTE_EXPIRED');
  });

  it('sanitizes database failures into a temporary-unavailable response', async () => {
    (prisma.paste.findUnique as any).mockRejectedValue(new Error('connection string leaked'));

    const response = await request(app).get('/api/snippets/database-failure');

    expect(response.status).toBe(503);
    expect(response.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(response.text).not.toContain('connection string leaked');
  });

  it('rejects oversized code before persistence', async () => {
    const response = await request(app)
      .post('/api/snippets')
      .send({ code: 'x'.repeat(600 * 1024) });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(prisma.paste.create).not.toHaveBeenCalled();
  });
});
