import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { ApiError, asyncH } from '../../lib/errors.js';
import { authRequired, requireRole } from '../../lib/auth.js';
import { serializeLocation, filterLocations, CATEGORIES, CITIES, YEARS } from './locations.service.js';

export const locationsRouter = Router();

const listQuerySchema = z.object({
  year: z.coerce.number().int().min(2023).max(2026).optional(),
  category: z.enum(CATEGORIES).optional(),
  city: z.enum(CITIES).optional(),
  // Trimmed, and blank-after-trim becomes "no filter" — typing a space should
  // not empty the map.
  q: z
    .string()
    .max(80)
    .transform((v) => v.trim())
    .transform((v) => (v.length ? v : undefined))
    .optional()
});

const detailQuerySchema = z.object({
  year: z.coerce.number().int().min(2023).max(2026).optional()
});

const timelineEntrySchema = z.object({
  status: z.enum(['damaged', 'restoring', 'construction', 'restored', 'active', 'planned']),
  note: z.string().max(200)
});

const upsertSchema = z.object({
  name: z.string().min(3).max(120),
  city: z.enum(CITIES),
  category: z.enum(CATEGORIES),
  lat: z.number().min(38).max(41),
  lng: z.number().min(45).max(48),
  shortDescription: z.string().min(10).max(300),
  history: z.string().min(10).max(2000),
  builtInfo: z.string().max(120).optional().default(''),
  visibleFrom: z.coerce.number().int().min(2023).max(2026),
  timeline: z.record(z.string().regex(/^202[3-6]$/), timelineEntrySchema),
  audioGuide: z
    .object({ durationSec: z.number().int().min(5).max(300), lines: z.array(z.string().max(300)).min(1).max(8) })
    .optional(),
  tags: z.array(z.string().max(40)).max(8).optional().default([])
});

locationsRouter.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncH(async (req, res) => {
    const { year = 2026 } = req.query;
    const list = filterLocations(req.query).map((l) => serializeLocation(l, { year }));
    res.json({ year, count: list.length, items: list });
  })
);

locationsRouter.get('/meta', (_req, res) => {
  res.json({ years: YEARS, categories: CATEGORIES, cities: CITIES });
});

locationsRouter.get(
  '/:id',
  validate(detailQuerySchema, 'query'),
  asyncH(async (req, res) => {
    const location = store.locations.get(req.params.id);
    if (!location) throw ApiError.notFound('Məkan tapılmadı');
    res.json({ item: serializeLocation(location, { year: req.query.year ?? 2026, full: true }) });
  })
);

/* ---------- admin CRUD ---------- */

locationsRouter.post(
  '/',
  authRequired,
  requireRole('admin'),
  validate(upsertSchema),
  asyncH(async (req, res) => {
    const location = {
      ...req.body,
      // id last on purpose: spreading the body first means a future schema
      // change that admits an `id` field still cannot let the caller pick one.
      id: store.id('loc'),
      audioGuide: req.body.audioGuide ?? { durationSec: 20, lines: [req.body.shortDescription] }
    };
    store.locations.set(location.id, location);
    store.persist();
    res.status(201).json({ item: serializeLocation(location, { full: true }) });
  })
);

locationsRouter.put(
  '/:id',
  authRequired,
  requireRole('admin'),
  validate(upsertSchema.partial()),
  asyncH(async (req, res) => {
    const location = store.locations.get(req.params.id);
    if (!location) throw ApiError.notFound('Məkan tapılmadı');
    Object.assign(location, req.body);
    store.persist();
    res.json({ item: serializeLocation(location, { full: true }) });
  })
);

locationsRouter.delete(
  '/:id',
  authRequired,
  requireRole('admin'),
  asyncH(async (req, res) => {
    if (!store.locations.delete(req.params.id)) throw ApiError.notFound('Məkan tapılmadı');
    store.persist();
    res.status(204).end();
  })
);
