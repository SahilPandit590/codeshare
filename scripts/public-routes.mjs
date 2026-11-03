export const SITE_ORIGIN = 'https://snipper.work.gd';

// Keep this list limited to pages that are intentionally indexable. User
// generated snippets, the composer, APIs and internal routes are excluded.
export const INDEXABLE_ROUTES = Object.freeze([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/features',
  '/how-it-works',
  '/faq',
  '/online-code-sharing',
  '/share-code-online',
  '/online-code-snippets',
  '/pastebin-alternative',
]);

export function toAbsoluteUrl(route) {
  if (!INDEXABLE_ROUTES.includes(route)) {
    throw new Error(`Route is not an indexable public route: ${route}`);
  }
  return `${SITE_ORIGIN}${route === '/' ? '/' : route}`;
}

export function createSitemapXml() {
  const urls = INDEXABLE_ROUTES.map((route) => `  <url>\n    <loc>${toAbsoluteUrl(route)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
