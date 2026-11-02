import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../backend/src/app';
import { prisma } from '../../backend/src/prisma/client';

vi.mock('../../backend/src/prisma/client', () => ({
  prisma: {
    paste: {
      create: vi.fn().mockResolvedValue({
        id: 'test-id',
        content: 'test',
        language: 'text',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
        deleteTokenHash: 'hash',
      }),
    },
  },
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    delete process.env.SKIP_RATE_LIMIT;
  });

  it('enforces rate limits when excessive requests are sent', async () => {
    const app = createApp();

    // Send requests up to limit
    let hitRateLimit = false;
    for (let i = 0; i < 35; i++) {
      const res = await request(app).post('/api/pastes').send({
        content: `Content #${i}`,
        language: 'text',
      });

      if (res.status === 429) {
        hitRateLimit = true;
        expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
        break;
      }
    }

    expect(hitRateLimit).toBe(true);
  });
});

