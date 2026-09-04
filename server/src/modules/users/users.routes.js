import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { ApiError, asyncH } from '../../lib/errors.js';
import { authRequired } from '../../lib/auth.js';
import { verifyPassword } from '../../lib/passwords.js';
import { computeBadges } from '../../lib/badges.js';

export const usersRouter = Router();
export const checkinsRouter = Router();

const deleteAccountSchema = z.object({
  // Re-authentication, not ceremony: a stolen token alone should not be able
  // to erase an account, and it stops a mis-click doing it either.
  password: z.string().min(1, 'Şifrə tələb olunur'),
  confirm: z.literal('SİL', { errorMap: () => ({ message: 'Təsdiq üçün SİL yazın' }) })
});

const checkinSchema = z.object({
  locationId: z.string().min(1, 'Məkan seçilməlidir'),
  method: z.enum(['gps', 'manual']).default('manual'),
  lat: z.number().optional(),
  lng: z.number().optional()
});

/** Haversine distance in km — used to validate GPS check-ins. */
function distanceKm(lat1, lng1, lat2, lng2) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

checkinsRouter.post(
  '/',
  authRequired,
  validate(checkinSchema),
  asyncH(async (req, res) => {
    const location = store.locations.get(req.body.locationId);
    if (!location) throw ApiError.notFound('Məkan tapılmadı');

    const already = [...store.checkins.values()].find(
      (c) => c.userId === req.user.id && c.locationId === location.id
    );
    if (already) throw ApiError.conflict('Bu məkanda artıq qeydiyyatdan keçmisiniz');

    let distance = null;
    if (req.body.method === 'gps') {
      if (typeof req.body.lat !== 'number' || typeof req.body.lng !== 'number') {
        throw ApiError.badRequest('GPS qeydiyyatı üçün koordinatlar tələb olunur');
      }
      distance = distanceKm(req.body.lat, req.body.lng, location.lat, location.lng);
      if (distance > 5) {
        throw ApiError.badRequest(
          `Məkandan ${Math.round(distance)} km uzaqdasınız — GPS qeydiyyatı 5 km daxilində mümkündür. Manual qeyd istifadə edin.`,
          [{ field: 'distanceKm', message: String(Math.round(distance)) }]
        );
      }
    }

    const checkin = {
      id: store.id('ch'),
      userId: req.user.id,
      locationId: location.id,
      method: req.body.method,
      createdAt: new Date().toISOString()
    };
    store.checkins.set(checkin.id, checkin);
    store.persist();
    res.status(201).json({ item: checkin, distanceKm: distance });
  })
);

usersRouter.get(
  '/me/passport',
  authRequired,
  asyncH(async (req, res) => {
    const checkins = store.checkinsForUser(req.user.id);
    const visited = checkins.map((c) => {
      const loc = store.locations.get(c.locationId);
      return {
        checkinId: c.id,
        method: c.method,
        visitedAt: c.createdAt,
        location: loc
          ? { id: loc.id, name: loc.name, city: loc.city, category: loc.category }
          : { id: c.locationId, name: 'Silinmiş məkan', city: null, category: null }
      };
    });
    const totalLocations = store.locations.size;
    const uniqueVisited = new Set(checkins.map((c) => c.locationId)).size;
    const badges = computeBadges(req.user.id, store);
    const myReviews = [...store.reviews.values()].filter((r) => r.userId === req.user.id).length;
    const myPosts = [...store.posts.values()].filter((p) => p.userId === req.user.id).length;

    res.json({
      totalLocations,
      visitedCount: uniqueVisited,
      percent: totalLocations ? Math.round((uniqueVisited / totalLocations) * 100) : 0,
      visited,
      badges,
      earnedBadges: badges.filter((b) => b.earned).length,
      stats: { reviews: myReviews, posts: myPosts, checkins: checkins.length }
    });
  })
);

usersRouter.delete(
  '/me',
  authRequired,
  validate(deleteAccountSchema),
  asyncH(async (req, res) => {
    if (!verifyPassword(req.body.password, req.user.passwordHash)) {
      throw ApiError.unauthorized('Şifrə yanlışdır');
    }
    // Losing the only admin would leave nobody able to moderate.
    if (req.user.role === 'admin' && store.countRole('admin') <= 1) {
      throw ApiError.forbidden('Son admin hesabı silinə bilməz — əvvəlcə başqa admin təyin edin');
    }

    const removed = store.deleteUserCompletely(req.user.id);
    console.log(`[qdx] account erased: ${req.user.id} ${JSON.stringify(removed)}`);
    res.status(204).end();
  })
);
