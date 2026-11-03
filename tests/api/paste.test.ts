import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../../backend/src/app';
import { prisma } from '../../backend/src/prisma/client';

// Mock prisma client
vi.mock('../../backend/src/prisma/client', () => {
  return {
    prisma: {
      paste: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      $queryRaw: vi.fn(),
    },
    checkDatabaseHealth: vi.fn().mockResolvedValue(true),
  };
});

describe('Paste API Endpoints', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.$queryRaw as any).mockResolvedValue([]);
    process.env.SKIP_RATE_LIMIT = 'true';
  });

  describe('POST /api/pastes', () => {
    it('creates a paste successfully with valid input', async () => {
      (prisma.paste.create as any).mockResolvedValue({
        id: 'mock-id-1234',
        content: 'console.log("Hello, Code Snipper!");',
        language: 'javascript',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        deleteTokenHash: 'mock-hash',
      });

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'console.log("Hello, Code Snipper!");',
          language: 'javascript',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('deleteToken');
      expect(response.body).toHaveProperty('deleteUrl');
      expect(response.body.language).toBe('javascript');
      expect(response.headers['cache-control']).toContain('no-store');

      expect(prisma.paste.create).toHaveBeenCalledOnce();
      const createArgs = (prisma.paste.create as any).mock.calls[0][0];
      expect(createArgs.data.content).toBe('console.log("Hello, Code Snipper!");');
      expect(createArgs.data.deleteTokenHash).toBeDefined();
    });

    it('defaults language to text if not provided', async () => {
      (prisma.paste.create as any).mockResolvedValue({
        id: 'mock-id-1234',
        content: 'Just some text',
        language: 'text',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        deleteTokenHash: 'mock-hash',
      });

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'Just some text',
        });

      expect(response.status).toBe(201);
      expect(response.body.language).toBe('text');
    });

    it('rejects empty content with 400', async () => {
      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: '',
          language: 'python',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });

    it('rejects whitespace-only content with 400', async () => {
      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: '   \n\t   ',
          language: 'python',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });

    it('rejects unsupported language with 400', async () => {
      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'echo "hello"',
          language: 'brainfuck',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });

    it('rejects content exceeding size limit with 400', async () => {
      // 600 KB payload
      const hugeContent = 'a'.repeat(600 * 1024);

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: hugeContent,
          language: 'text',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });

    it('returns 503 when maximum active paste count capacity is reached', async () => {
      (prisma.$queryRaw as any).mockResolvedValueOnce([
        { count: 2000n, total_bytes: 1024n },
      ]);

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'Hello capacity limit',
          language: 'text',
        });

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('CAPACITY_EXHAUSTED');
      expect(response.body.error.message).toContain('capacity');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });

    it('returns 503 when maximum active storage capacity is reached', async () => {
      // 500 MB limit reached
      (prisma.$queryRaw as any).mockResolvedValueOnce([
        { count: 10n, total_bytes: 524288000n },
      ]);

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'Hello storage limit',
          language: 'text',
        });

      expect(response.status).toBe(503);
      expect(response.body.error.code).toBe('CAPACITY_EXHAUSTED');
      expect(response.body.error.message).toContain('storage');
      expect(prisma.paste.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/pastes/:id', () => {
    it('retrieves an active paste successfully and never exposes delete tokens', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 3600 * 1000); // 10 hours in future

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'valid-id-1234',
        content: 'const x = 42;',
        language: 'typescript',
        createdAt: now,
        expiresAt,
        deleteTokenHash: 'super-secret-hash-that-must-never-leak',
      });

      const response = await request(app).get('/api/pastes/valid-id-1234');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('valid-id-1234');
      expect(response.body.content).toBe('const x = 42;');
      expect(response.body.language).toBe('typescript');

      // Security check: deletion token/hash must NEVER be exposed
      expect(response.body.deleteToken).toBeUndefined();
      expect(response.body.deleteTokenHash).toBeUndefined();
      expect(response.text).not.toContain('super-secret-hash-that-must-never-leak');
    });

    it('returns 404 for non-existent paste', async () => {
      (prisma.paste.findUnique as any).mockResolvedValue(null);

      const response = await request(app).get('/api/pastes/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 410 Gone for expired paste', async () => {
      const now = new Date();
      const expiredTime = new Date(now.getTime() - 1000); // 1 second ago

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'expired-id-12',
        content: 'Old secret',
        language: 'text',
        createdAt: new Date(now.getTime() - 25 * 3600 * 1000),
        expiresAt: expiredTime,
        deleteTokenHash: 'hash',
      });

      const response = await request(app).get('/api/pastes/expired-id-12');

      expect(response.status).toBe(410);
      expect(response.body.error.code).toBe('PASTE_EXPIRED');
    });

    it('treats exact boundary expiresAt <= now as expired (410)', async () => {
      const exactNow = new Date();
      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'exact-boundary-id',
        content: 'Boundary content',
        language: 'text',
        createdAt: new Date(exactNow.getTime() - 24 * 3600 * 1000),
        expiresAt: exactNow, // exact boundary
        deleteTokenHash: 'hash',
      });

      const response = await request(app).get('/api/pastes/exact-boundary-id');

      expect(response.status).toBe(410);
      expect(response.body.error.code).toBe('PASTE_EXPIRED');
    });

    it('rejects malformed paste ID with 400', async () => {
      const response = await request(app).get('/api/pastes/bad!id$special');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(prisma.paste.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/pastes/:id', () => {
    it('deletes paste with valid deletion token', async () => {
      const rawToken = 'my-secret-deletion-token-12345';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'paste-to-delete',
        content: 'Confidential',
        language: 'text',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: tokenHash,
      });
      (prisma.paste.delete as any).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/pastes/paste-to-delete')
        .set('x-delete-token', rawToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
      expect(prisma.paste.delete).toHaveBeenCalledWith({
        where: { id: 'paste-to-delete' },
      });
    });

    it('accepts deletion token via query parameter', async () => {
      const rawToken = 'query-param-token-12345678';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'paste-query-del',
        content: 'Confidential',
        language: 'text',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: tokenHash,
      });
      (prisma.paste.delete as any).mockResolvedValue({});

      const response = await request(app)
        .delete(`/api/pastes/paste-query-del?token=${rawToken}`);

      expect(response.status).toBe(200);
      expect(prisma.paste.delete).toHaveBeenCalled();
    });

    it('rejects deletion with invalid token with 403 Forbidden', async () => {
      const realToken = 'correct-token-1234567890';
      const wrongToken = 'wrong-token-999999999999';
      const tokenHash = crypto.createHash('sha256').update(realToken).digest('hex');

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'paste-protected',
        content: 'Do not delete',
        language: 'text',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: tokenHash,
      });

      const response = await request(app)
        .delete('/api/pastes/paste-protected')
        .set('x-delete-token', wrongToken);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(prisma.paste.delete).not.toHaveBeenCalled();
    });

    it('returns 400 when deletion token is missing', async () => {
      const response = await request(app).delete('/api/pastes/paste-no-token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
      expect(prisma.paste.delete).not.toHaveBeenCalled();
    });

    it('returns 404 when attempting to delete non-existent paste', async () => {
      (prisma.paste.findUnique as any).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/pastes/not-found-paste')
        .set('x-delete-token', 'some-valid-length-token-1234');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 410 when attempting to delete expired paste', async () => {
      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'expired-paste-id',
        content: 'Expired',
        language: 'text',
        createdAt: new Date(Date.now() - 30 * 3600 * 1000),
        expiresAt: new Date(Date.now() - 1000),
        deleteTokenHash: 'hash',
      });

      const response = await request(app)
        .delete('/api/pastes/expired-paste-id')
        .set('x-delete-token', 'some-token-that-is-long-enough');

      expect(response.status).toBe(410);
      expect(response.body.error.code).toBe('PASTE_EXPIRED');
      expect(prisma.paste.delete).not.toHaveBeenCalled();
    });
  });

  describe('Database and System Failure Handling', () => {
    it('returns 500 without leaking database internal errors in production', async () => {
      (prisma.paste.create as any).mockRejectedValue(new Error('FATAL: connection to server on socket failed'));

      const response = await request(app)
        .post('/api/pastes')
        .send({
          content: 'Hello World',
          language: 'text',
        });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      // In production mode, DB internal errors must be sanitized
      if (process.env.NODE_ENV === 'production') {
        expect(response.body.error.message).not.toContain('socket failed');
      }
    });
  });

  describe('Content Safety & Code Execution', () => {
    it('stores arbitrary HTML and script tags as literal text without execution', async () => {
      const maliciousPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
      (prisma.paste.create as any).mockResolvedValue({
        id: 'xss-paste-id',
        content: maliciousPayload,
        language: 'html',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: 'hash',
      });

      const postRes = await request(app)
        .post('/api/pastes')
        .send({
          content: maliciousPayload,
          language: 'html',
        });

      expect(postRes.status).toBe(201);

      (prisma.paste.findUnique as any).mockResolvedValue({
        id: 'xss-paste-id',
        content: maliciousPayload,
        language: 'html',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: 'hash',
      });

      const getRes = await request(app).get('/api/pastes/xss-paste-id');
      expect(getRes.status).toBe(200);
      // Literal content is preserved exactly
      expect(getRes.body.content).toBe(maliciousPayload);
    });
  });
});
