import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config.js';
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

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // correct client IPs for rate limiting behind nginx/render

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
  app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
  app.use(express.json({ limit: '1mb' }));
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
  app.use('/api/auth', authLimiter);
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
    res.json({ status: 'ok', env: config.env, time: new Date().toISOString() })
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
    app.use(express.static(distDir, { maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
    console.log('[qdx] serving mobile/dist — app available on the API port');
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
