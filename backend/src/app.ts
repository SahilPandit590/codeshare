import express, { Express, Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import pasteRoutes from './routes/paste.routes';
import snippetRoutes from './routes/snippet.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';

const SEO_ORIGIN = 'https://snipper.work.gd';

interface ServerSeoMetadata {
  title: string;
  description: string;
  canonicalPath?: string;
  robots: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  kind?: 'home' | 'faq' | 'page';
}

const SERVER_SEO_PAGES: Record<string, ServerSeoMetadata> = {
  '/': {
    title: 'Code Snipper – Share Code Snippets Online Instantly',
    description: 'Create, store and share code snippets online with Code Snipper. Paste your code, generate a temporary link and send it to anyone.',
    canonicalPath: '/',
    robots: 'index,follow',
    kind: 'home',
  },
  '/about': {
    title: 'About Code Snipper – Temporary Code Sharing',
    description: 'Learn how Code Snipper provides simple, anonymous and temporary sharing for code snippets, logs, notes and plain text.',
    robots: 'index,follow',
  },
  '/privacy': {
    title: 'Privacy Policy – Code Snipper',
    description: 'Read the Code Snipper privacy policy, including temporary paste storage, deletion tokens, rate limiting and advertising disclosures.',
    robots: 'index,follow',
  },
  '/terms': {
    title: 'Terms of Service – Code Snipper',
    description: 'Review the Code Snipper terms for temporary, anonymous code and text sharing.',
    robots: 'index,follow',
  },
  '/features': {
    title: 'Code Snipper Features – Fast, Temporary Code Sharing',
    description: 'Explore Code Snipper features: anonymous sharing, syntax highlighting, 24-hour expiry, deletion links and safe read-only rendering.',
    robots: 'index,follow',
  },
  '/how-it-works': {
    title: 'How Code Snipper Works – Create and Share Code Links',
    description: 'See how to paste code, choose a language, create a temporary sharing link and share it with teammates in seconds.',
    robots: 'index,follow',
  },
  '/faq': {
    title: 'Code Snipper FAQ – Online Code Sharing Questions',
    description: 'Answers about Code Snipper paste expiry, supported languages, privacy, deletion links, limits and sharing code without an account.',
    robots: 'index,follow',
    kind: 'faq',
  },
  '/online-code-sharing': {
    title: 'Online Code Sharing Without Signup – Code Snipper',
    description: 'Share source code, logs and notes online without creating an account. Code Snipper creates a simple link and removes pastes after 24 hours.',
    robots: 'index,follow',
  },
  '/share-code-online': {
    title: 'Share Code Online in Seconds – Code Snipper',
    description: 'Paste code online, select a language and send a clean sharing link to a teammate, support agent or another device.',
    robots: 'index,follow',
  },
  '/online-code-snippets': {
    title: 'Online Code Snippets for Developers – Code Snipper',
    description: 'Create temporary online code snippets with syntax highlighting for JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS and more.',
    robots: 'index,follow',
  },
  '/pastebin-alternative': {
    title: 'Pastebin Alternative for Temporary Code Sharing – Code Snipper',
    description: 'Compare Code Snipper with traditional paste tools: no signup, 512 KB pastes, syntax highlighting, simple links and automatic 24-hour expiry.',
    robots: 'index,follow',
  },
  '/create': {
    title: 'Create a Code Snippet – Code Snipper',
    description: 'Create a temporary code or text sharing link with Code Snipper.',
    robots: 'noindex,follow',
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function getServerSeoMetadata(pathname: string): ServerSeoMetadata {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const page = SERVER_SEO_PAGES[normalizedPath];
  if (page) return { ...page, canonicalPath: page.canonicalPath ?? normalizedPath };

  const sharedMatch = normalizedPath.match(/^\/(p|s)\/([A-Za-z0-9_-]+)/);
  if (sharedMatch) {
    const canonicalPath = `/${sharedMatch[1]}/${sharedMatch[2]}`;
    return {
      title: 'Shared Code Snippet – Code Snipper',
      description: 'A temporary code or text snippet shared through Code Snipper.',
      canonicalPath,
      robots: 'noindex,nofollow',
    };
  }

  const shortCodeMatch = normalizedPath.match(/^\/([A-Za-z0-9]{6})$/);
  if (shortCodeMatch) {
    return {
      title: 'Shared Code Snippet – Code Snipper',
      description: 'A temporary code or text snippet shared through Code Snipper.',
      canonicalPath: `/${shortCodeMatch[1]}`,
      robots: 'noindex,nofollow',
    };
  }

  return {
    title: 'Page Not Found – Code Snipper',
    description: 'The requested Code Snipper page could not be found.',
    canonicalPath: normalizedPath,
    robots: 'noindex,nofollow',
  };
}

function getStructuredData(metadata: ServerSeoMetadata): unknown[] {
  if (metadata.robots.startsWith('noindex')) return [];

  const canonicalUrl = `${SEO_ORIGIN}${metadata.canonicalPath === '/' ? '/' : metadata.canonicalPath ?? '/'}`;
  if (metadata.kind === 'home') {
    return [
      { '@type': 'WebSite', '@id': `${SEO_ORIGIN}/#website`, url: `${SEO_ORIGIN}/`, name: 'Code Snipper', description: metadata.description },
      { '@type': 'WebApplication', '@id': `${SEO_ORIGIN}/#application`, name: 'Code Snipper', url: `${SEO_ORIGIN}/`, description: metadata.description, applicationCategory: 'DeveloperApplication', operatingSystem: 'Web' },
    ];
  }

  const graph: unknown[] = [{
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Code Snipper', item: `${SEO_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: metadata.title.split(' – ')[0], item: canonicalUrl },
    ],
  }];

  if (metadata.kind === 'faq') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Do I need an account to use Code Snipper?', acceptedAnswer: { '@type': 'Answer', text: 'No. Code Snipper lets you create and share temporary code snippets without an account.' } },
        { '@type': 'Question', name: 'How long do Code Snipper snippets last?', acceptedAnswer: { '@type': 'Answer', text: 'Snippets are designed to expire and become inaccessible 24 hours after creation.' } },
        { '@type': 'Question', name: 'Does Code Snipper execute pasted code?', acceptedAnswer: { '@type': 'Answer', text: 'No. Code Snipper displays pasted content as text or syntax-highlighted code and does not execute it.' } },
      ],
    });
  }

  return graph;
}

function renderSeoHtml(template: string, metadata: ServerSeoMetadata): string {
  const canonicalUrl = `${SEO_ORIGIN}${metadata.canonicalPath === '/' ? '/' : metadata.canonicalPath ?? '/'}`;
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const robots = escapeHtml(metadata.robots);
  const replaceMeta = (html: string, selector: RegExp, replacement: string) => html.replace(selector, replacement);
  let html = replaceMeta(template, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceMeta(html, /<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${description}" />`);
  html = replaceMeta(html, /<meta name="robots" content="[^"]*"\s*\/>/i, `<meta name="robots" content="${robots}" />`);
  html = replaceMeta(html, /<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = replaceMeta(html, /<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = replaceMeta(html, /<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceMeta(html, /<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceMeta(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceMeta(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceMeta(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': getStructuredData(metadata) })}</script>`);
  return html;
}

export function createApp(): Express {
  const app = express();

  // Configure trust proxy for Render reverse proxy (1 hop)
  // Ensures req.ip reflects actual client IP rather than trusting arbitrary headers
  app.set('trust proxy', 1);

  // Build allowed CORS origins list from CORS_ORIGIN and APP_BASE_URL (excluding wildcards)
  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');

  let appBaseOrigin: string | null = null;
  try {
    if (env.APP_BASE_URL) {
      appBaseOrigin = new URL(env.APP_BASE_URL).origin;
      if (!allowedOrigins.includes(appBaseOrigin)) {
        allowedOrigins.push(appBaseOrigin);
      }
    }
  } catch {
    // Ignore invalid URL formatting
  }

  // Set of known, verified hosts for safe same-origin validation
  const allowedHosts = new Set<string>();
  if (appBaseOrigin) {
    try {
      allowedHosts.add(new URL(appBaseOrigin).host.toLowerCase());
    } catch {
      // Ignore
    }
  }
  for (const originStr of allowedOrigins) {
    try {
      allowedHosts.add(new URL(originStr).host.toLowerCase());
    } catch {
      // Ignore
    }
  }
  // Permit localhost and 127.0.0.1 for local development
  if (env.NODE_ENV !== 'production') {
    allowedHosts.add('localhost');
    allowedHosts.add('127.0.0.1');
  }

  // Basic security hardening with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://pagead2.googlesyndication.com',
            'https://tpc.googlesyndication.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: [
            "'self'",
            'data:',
            'https://pagead2.googlesyndication.com',
            'https://tpc.googlesyndication.com',
          ],
          frameSrc: [
            "'self'",
            'https://googleads.g.doubleclick.net',
            'https://pagead2.googlesyndication.com',
            'https://tpc.googlesyndication.com',
          ],
          connectSrc: [
            "'self'",
            'https://pagead2.googlesyndication.com',
            ...allowedOrigins,
          ],
          workerSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS middleware scoped strictly to /api routes
  const apiCorsMiddleware = cors<Request>((req, callback) => {
    const origin = req.headers.origin;

    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, { origin: true });
    }

    // Check if origin dynamically matches a verified known host (prevents spoofed Host headers)
    const host = req.get('host');
    const hostWithoutPort = host ? host.split(':')[0].toLowerCase() : '';
    const isKnownHost = host
      ? allowedHosts.has(host.toLowerCase()) || allowedHosts.has(hostWithoutPort)
      : false;

    const isSameOrigin = (host && isKnownHost)
      ? origin === `${req.protocol}://${host}` ||
        origin === `http://${host}` ||
        origin === `https://${host}`
      : false;

    const isAllowed =
      allowedOrigins.includes(origin) ||
      (appBaseOrigin !== null && origin === appBaseOrigin) ||
      isSameOrigin;

    if (isAllowed) {
      callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-delete-token'],
        credentials: true,
        maxAge: 86400,
      });
    } else {
      callback(null, { origin: false });
    }
  });

  // Apply CORS specifically to API routes
  app.use('/api', apiCorsMiddleware);

  // Parse incoming JSON payloads with size guard
  app.use(express.json({ limit: `${Math.ceil(env.MAX_PASTE_SIZE_BYTES / 1024) + 128}kb` }));

  // API Routes
  app.use('/api/pastes', pasteRoutes);
  app.use('/api/snippets', snippetRoutes);
  app.use('/api/health', healthRoutes);

  // Dedicated /ads.txt endpoint (ensures HTTP 200 text/plain in all environments)
  app.get('/ads.txt', (_req, res) => {
    const distAdsTxtPath = path.resolve(__dirname, '../../frontend/dist/ads.txt');
    const publicAdsTxtPath = path.resolve(__dirname, '../../frontend/public/ads.txt');
    if (fs.existsSync(distAdsTxtPath)) {
      return res.type('text/plain').sendFile(distAdsTxtPath);
    }
    if (fs.existsSync(publicAdsTxtPath)) {
      return res.type('text/plain').sendFile(publicAdsTxtPath);
    }
    res.type('text/plain').send('# Google AdSense ads.txt for Code Snipper\n# Replace with your actual publisher account ID after approval\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n');
  });

  // In production, serve the built frontend static files
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    const frontendIndexPath = path.join(frontendDistPath, 'index.html');
    const frontendIndexHtml = fs.readFileSync(frontendIndexPath, 'utf8');

    // Client-side routing fallback with route-aware SEO tags. Shared and
    // unknown routes are marked non-indexable before JavaScript renders.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }

      const normalizedPath = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
      const isSharedRoute = /^\/(p|s)\/[A-Za-z0-9_-]+(?:\/.*)?$/.test(normalizedPath)
        || /^\/[A-Za-z0-9]{6}$/.test(normalizedPath);
      const isKnownRoute = normalizedPath === '/index.html' || Boolean(SERVER_SEO_PAGES[normalizedPath]) || isSharedRoute;
      const routePath = normalizedPath === '/index.html' ? '/' : normalizedPath;
      const metadata = getServerSeoMetadata(routePath);

      res.status(isKnownRoute ? 200 : 404).type('html').send(renderSeoHtml(frontendIndexHtml, metadata));
    });
  }

  // 404 handler for undefined API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested API route does not exist',
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
