import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { asyncH } from '../../lib/errors.js';

export const timelineRouter = Router();

const querySchema = z.object({
  year: z.coerce.number().int().min(2023).max(2026).optional(),
  city: z.enum(['shusha', 'khankendi', 'region']).optional()
});

timelineRouter.get(
  '/',
  validate(querySchema, 'query'),
  asyncH(async (req, res) => {
    let items = [...store.timeline];
    if (req.query.year) items = items.filter((e) => e.year === req.query.year);
    if (req.query.city) items = items.filter((e) => e.city === req.query.city);
    items.sort((a, b) => a.year - b.year || a.month - b.month);
    res.json({ count: items.length, items });
  })
);
