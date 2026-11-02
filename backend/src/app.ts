import express, { Express, Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import pasteRoutes from './routes/paste.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';

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
    res.type('text/plain').send('# Google AdSense ads.txt for CodeShare\n# Replace with your actual publisher account ID after approval\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n');
  });

  // In production, serve the built frontend static files
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    // Client-side routing fallback (for /p/:id etc.)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
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

