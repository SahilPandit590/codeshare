import { describe, it, expect, vi } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
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

  it('serves route-aware metadata and correct status/indexing directives', async () => {
    const faq = await request(app).get('/faq').set('Accept', 'text/html');
    expect(faq.status).toBe(200);
    expect(faq.text).toContain('<title>Code Snipper FAQ – Online Code Sharing Questions</title>');
    expect(faq.text).toContain('<meta name="robots" content="index,follow" />');
    expect(faq.text).toContain('<link rel="canonical" href="https://snipper.work.gd/faq" />');
    expect(faq.text).toContain('"@type":"FAQPage"');

    const create = await request(app).get('/create').set('Accept', 'text/html');
    expect(create.status).toBe(200);
    expect(create.text).toContain('<meta name="robots" content="noindex,follow" />');

    const shared = await request(app).get('/p/server-rendered-id').set('Accept', 'text/html');
    expect(shared.status).toBe(200);
    expect(shared.text).toContain('<meta name="robots" content="noindex,nofollow" />');
    expect(shared.text).toContain('<link rel="canonical" href="https://snipper.work.gd/p/server-rendered-id" />');

    const missing = await request(app).get('/does-not-exist').set('Accept', 'text/html');
    expect(missing.status).toBe(404);
    expect(missing.text).toContain('<meta name="robots" content="noindex,nofollow" />');
  });

  it('serves an indexable robots policy and public sitemap', async () => {
    const robots = await request(app)
      .get('/robots.txt')
      .set('User-Agent', 'Googlebot/2.1 (+http://www.google.com/bot.html)');

    expect(robots.status).toBe(200);
    expect(robots.headers['content-type']).toContain('text/plain');
    expect(robots.text).toContain('User-agent: *');
    expect(robots.text).toContain('Allow: /');
    expect(robots.text).toContain('Sitemap: https://snipper.work.gd/sitemap.xml');

    const sitemap = await request(app)
      .get('/sitemap.xml')
      .set('User-Agent', 'Googlebot/2.1 (+http://www.google.com/bot.html)');

    expect(sitemap.status).toBe(200);
    expect(sitemap.headers['content-type']).toContain('application/xml');
    expect(sitemap.text).toContain('<urlset');
    expect(sitemap.text).toContain('<loc>https://snipper.work.gd/</loc>');
    expect(sitemap.text).not.toContain('/api/');
    expect(sitemap.text).not.toContain('/p/');
    expect(sitemap.text).not.toContain('/s/');

    const sitemapUrls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    const pageResponses = await Promise.all(sitemapUrls.map((url) => request(app).get(url).set('Accept', 'text/html')));
    expect(pageResponses.every((response) => response.status === 200)).toBe(true);
  });

  it('serves the IndexNow verification key as public plain text', async () => {
    const keyFile = readdirSync(path.resolve(process.cwd(), 'frontend/public'))
      .find((file) => /^indexnow-[a-f0-9]{32}\.txt$/i.test(file));
    expect(keyFile).toBeDefined();
    const key = readFileSync(path.resolve(process.cwd(), 'frontend/public', keyFile as string), 'utf8').trim();
    const response = await request(app).get(`/${keyFile}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text.trim()).toBe(key);
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
