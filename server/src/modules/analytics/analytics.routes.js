import { Router } from 'express';
import { store } from '../../store.js';
import { asyncH } from '../../lib/errors.js';
import { statusAt, YEARS, CATEGORIES } from '../locations/locations.service.js';

export const analyticsRouter = Router();

/** “Dirçəliş İndeksi” — headline stats + per-year series + live map-derived counts. */
analyticsRouter.get(
  '/revival-index',
  asyncH(async (_req, res) => {
    const years = store.revivalIndex;
    const latest = years[years.length - 1];

    const locations = [...store.locations.values()];
    const byCategory = CATEGORIES.map((category) => ({
      category,
      count: locations.filter((l) => l.category === category).length
    })).filter((c) => c.count > 0);

    const statusByYear = YEARS.map((year) => {
      const visible = locations.filter((l) => l.visibleFrom <= year);
      const buckets = { active: 0, restored: 0, inProgress: 0, damaged: 0, planned: 0 };
      for (const loc of visible) {
        const st = statusAt(loc, year)?.status;
        if (st === 'active') buckets.active += 1;
        else if (st === 'restored') buckets.restored += 1;
        else if (st === 'restoring' || st === 'construction') buckets.inProgress += 1;
        else if (st === 'planned') buckets.planned += 1;
        else buckets.damaged += 1;
      }
      return { year, total: visible.length, ...buckets };
    });

    const community = {
      reviews: store.reviews.size,
      posts: store.posts.size,
      checkins: store.checkins.size,
      users: store.users.size
    };

    res.json({ latest, years, byCategory, statusByYear, community });
  })
);
