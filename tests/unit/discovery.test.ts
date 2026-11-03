import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { findIndexNowKey, createIndexNowPayload, normalizeIndexNowUrls, submitToIndexNow } from '../../scripts/indexnow.mjs';
import { INDEXABLE_ROUTES, SITE_ORIGIN, createSitemapXml } from '../../scripts/public-routes.mjs';

const root = process.cwd();

describe('Search engine discovery assets', () => {
  it('keeps the sitemap limited to unique canonical indexable routes', async () => {
    const sitemap = await readFile(path.join(root, 'frontend/public/sitemap.xml'), 'utf8');
    expect(sitemap).toBe(createSitemapXml());

    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(urls).toEqual(normalizeIndexNowUrls(INDEXABLE_ROUTES));
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => url.startsWith(`${SITE_ORIGIN}/`))).toBe(true);
    expect(sitemap).not.toMatch(/\/(api|p|s|create|login|signup|dashboard)(\/|<)/);
  });

  it('preserves Google verification and complete social metadata', async () => {
    const html = await readFile(path.join(root, 'frontend/index.html'), 'utf8');
    expect(html).toMatch(/<meta name="google-site-verification" content="[^"]+" \/>/);
    expect(html).toContain('<meta property="og:locale" content="en_US" />');
    expect(html).toContain('<meta property="og:image" content="https://snipper.work.gd/og-image.svg" />');
    expect(html).toContain('<meta name="twitter:image" content="https://snipper.work.gd/og-image.svg" />');
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
  });

  it('validates the generated IndexNow key and allow-lists canonical URLs', async () => {
    const { key, fileName } = await findIndexNowKey();
    expect(key).toMatch(/^[a-f0-9]{32}$/i);
    expect(fileName).toBe(`indexnow-${key}.txt`);

    const payload = createIndexNowPayload({
      key,
      keyLocation: `${SITE_ORIGIN}/${fileName}`,
      urls: [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/faq`, `${SITE_ORIGIN}/faq`],
    });
    expect(payload.host).toBe('snipper.work.gd');
    expect(payload.urlList).toEqual([`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/faq`]);
    expect(() => createIndexNowPayload({ key, keyLocation: `${SITE_ORIGIN}/${fileName}`, urls: ['https://example.com/'] })).toThrow();
  });

  it('submits IndexNow through a mockable client with retryable responses', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 202 });
    const result = await submitToIndexNow({
      host: 'snipper.work.gd',
      key: 'a'.repeat(32),
      keyLocation: `${SITE_ORIGIN}/indexnow-${'a'.repeat(32)}.txt`,
      urlList: [`${SITE_ORIGIN}/faq`],
    }, { fetchImpl, retries: 1 });

    expect(result.status).toBe(202);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.indexnow.org/indexnow');

    const rejectedFetch = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    await expect(submitToIndexNow({
      host: 'snipper.work.gd',
      key: 'a'.repeat(32),
      keyLocation: `${SITE_ORIGIN}/indexnow-${'a'.repeat(32)}.txt`,
      urlList: [`${SITE_ORIGIN}/faq`],
    }, { fetchImpl: rejectedFetch, retries: 2 })).rejects.toThrow('HTTP 400');
    expect(rejectedFetch).toHaveBeenCalledTimes(1);
  });
});
