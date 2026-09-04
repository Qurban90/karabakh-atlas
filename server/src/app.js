import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
import { store } from './store.js';
import { sanitizeBody } from './lib/sanitize.js';
import { notFoundHandler, errorHandler } from './lib/errors.js';
import { openapiSpec } from './docs/openapi.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { locationsRouter } from './modules/locations/locations.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { postsRouter } from './modules/posts/posts.routes.js';
import { timelineRouter } from './modules/timeline/timeline.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';
import { usersRouter, checkinsRouter } from './modules/users/users.routes.js';

/** Resolves the CORS policy from configuration; see the note at its use site. */
function corsOrigin() {
  const configured = config.corsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o && o !== '*');

  if (configured.length) return configured;          // explicit allow-list
  if (config.isProd) return false;                   // same-origin only
  return true;                                       // development: reflect
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs for rate limiting behind nginx/render

  /**
   * Force HTTPS in production. Render terminates TLS at its edge and forwards
   * over http, so the scheme has to come from x-forwarded-proto rather than
   * req.protocol. HSTS (set by helmet below) only helps browsers that have
   * already seen a secure response — this covers the very first request.
   *
   * The health check is exempt: platform probes may call it over plain http,
   * and answering them with a 301 would look like a failing service.
   */
  if (config.isProd) {
    app.use((req, res, next) => {
      if (req.path === '/api/health') return next();
      if (req.get('x-forwarded-proto') === 'http') {
        return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`);
      }
      next();
    });
  }

  app.use(
    helmet({
      // CSP tuned for the bundled SPA: OpenStreetMap tiles are the only external origin
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://tile.openstreetmap.org', 'https://*.tile.openstreetmap.org'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'self'"]
        }
      }
    })
  );

  /**
   * Permissions-Policy — helmet does not set this. The app asks for
   * geolocation (GPS check-in) and nothing else, so everything else is denied
   * outright: a compromised dependency cannot quietly reach for the camera or
   * microphone, and geolocation is confined to our own origin.
   */
  app.use((_req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      [
        'geolocation=(self)',
        'camera=()',
        'microphone=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()',
        'interest-cohort=()'
      ].join(', ')
    );
    next();
  });
  /**
   * CORS. The client is served from this same origin, so in production the
   * safe default is to grant no cross-origin access at all — CORS_ORIGIN only
   * needs a value if the client is ever hosted separately (e.g. Vercel).
   *
   * Worth being clear about what this does and does not do: CORS is enforced
   * by browsers, and only protects *other people's* browsers from being used
   * against this API. It stops nothing from curl, Postman or a script — those
   * are held off by authentication and rate limiting, not by this header.
   */
  app.use(cors({ origin: corsOrigin(), credentials: false, maxAge: 600 }));
  // This API is text-only — the largest legitimate body is an admin location
  // create, a few KB. 1mb was ~100x more than anything needs, and every byte
  // of that is parsed into memory before a single validator runs.
  app.use(express.json({ limit: '64kb' }));
  app.use(sanitizeBody);

  /* ---------- rate limiting ---------- */
  const baseLimiter = rateLimit({
    windowMs: config.rate.windowMs,
    limit: config.rate.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Çox sayda sorğu — bir az sonra yenidən cəhd edin' } }
  });
  const authLimiter = rateLimit({
    windowMs: config.rate.windowMs,
    limit: config.rate.authMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Çox sayda giriş cəhdi — bir az sonra yenidən cəhd edin' } }
  });
  const writeLimiter = rateLimit({
    windowMs: config.rate.windowMs,
    limit: config.rate.writeMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.method === 'GET',
    message: { error: { code: 'RATE_LIMITED', message: 'Çox sayda yazma sorğusu — bir az sonra yenidən cəhd edin' } }
  });
  app.use('/api', baseLimiter);
  // Only the credential endpoints get the strict budget. /auth/me used to share
  // it, and the client calls that on every load to restore a session — a user
  // reloading the app could burn through the login allowance without ever
  // typing a password.
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api', writeLimiter);

  /* ---------- docs ---------- */
  app.get('/api/docs.json', (_req, res) => res.json(openapiSpec));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: 'QDX API Docs',
      swaggerOptions: { persistAuthorization: true }
    })
  );

  /* ---------- routes ---------- */
  app.get('/api/health', (_req, res) =>
    res.json({ status: 'ok', env: config.env, db: store.backend, time: new Date().toISOString() })
  );
  app.use('/api/auth', authRouter);
  app.use('/api/locations', locationsRouter);
  app.use('/api', reviewsRouter); // /locations/:id/reviews + /reviews/:id
  app.use('/api/posts', postsRouter);
  app.use('/api/timeline', timelineRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/checkins', checkinsRouter);
  app.use('/api/users', usersRouter);

  /* ---------- bundled SPA (single-process deployment) ----------
     When mobile/dist exists (local prod run, Docker single image, Render),
     the API server also serves the app with an SPA history fallback. */
  const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'mobile', 'dist');
  if (fs.existsSync(distDir)) {
    // hashed /assets get long cache; entry documents must always revalidate
    const noStore = ['index.html', 'sw.js', 'manifest.webmanifest'];
    app.use(
      express.static(distDir, {
        maxAge: '7d',
        setHeaders: (res, filePath) => {
          if (noStore.some((f) => filePath.endsWith(f))) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        }
      })
    );
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
    console.log('[qdx] serving mobile/dist — app available on the API port');
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
