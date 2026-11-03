import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../backend/src/app';
import { env } from '../../backend/src/config/env';
import * as dbModule from '../../backend/src/prisma/client';

describe('CORS & Static Asset Handling', () => {
  const app = createApp();

  it('allows same-origin static frontend asset requests without CORS blocking', async () => {
    // Static frontend requests attach an Origin header in browser builds.
    const res = await request(app)
      .get('/index.html')
      .set('Origin', 'https://snipper.work.gd');

    // Must NOT return 500 "Blocked by CORS policy"
    expect(res.status).toBe(200);
    expect(res.status).not.toBe(500);
  });

  it('serves the frontend shell for direct shared URL navigation and refresh', async () => {
    const res = await request(app)
      .get('/s/direct-navigation-test')
      .set('Accept', 'text/html');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<div id="root">');
  });

  it('allows API requests from configured CORS_ORIGIN', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('allows API requests from configured APP_BASE_URL origin', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const appOrigin = new URL(env.APP_BASE_URL).origin;
    const res = await request(app)
      .get('/api/health')
      .set('Origin', appOrigin);

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(appOrigin);
  });

  it('allows API requests matching a verified host dynamically (same-origin)', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app)
      .get('/api/health')
      .set('Host', 'localhost:3000')
      .set('Origin', 'http://localhost:3000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('handles preflight OPTIONS requests for API routes with proper methods and headers', async () => {
    const res = await request(app)
      .options('/api/pastes')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type, x-delete-token');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('does not grant CORS access to unauthorized cross-origin requests and does not throw 500', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://unauthorized-attacker.com');

    // Should succeed or return clean response, but NEVER include Access-Control-Allow-Origin
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).not.toBe(500);
  });

  it('rejects spoofed Host headers that attempt to bypass same-origin check', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app)
      .get('/api/health')
      .set('Host', 'spoofed-attacker.com')
      .set('Origin', 'https://spoofed-attacker.com');

    // Spoofed host is not an allowed host, so must not receive Access-Control-Allow-Origin
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.status).toBe(200);
  });

  it('allows requests with no Origin header (curl, server-to-server, health check)', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue(true);

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
