import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { ApiError, asyncH } from '../../lib/errors.js';
import { authRequired, publicUser } from '../../lib/auth.js';

export const reviewsRouter = Router();

const createSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Qiymət 1–5 olmalıdır').max(5, 'Qiymət 1–5 olmalıdır'),
  text: z.string().min(10, 'Rəy ən azı 10 simvol olmalıdır').max(600, 'Rəy 600 simvoldan uzun ola bilməz'),
  visitYear: z.coerce.number().int().min(2023).max(2026).optional()
});

function serializeReview(review) {
  return { ...review, user: publicUser(store.users.get(review.userId)) };
}

reviewsRouter.get(
  '/locations/:locationId/reviews',
  asyncH(async (req, res) => {
    const location = store.locations.get(req.params.locationId);
    if (!location) throw ApiError.notFound('Məkan tapılmadı');
    const items = store.reviewsForLocation(location.id).map(serializeReview);
    const rating = store.ratingFor(location.id);
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: items.filter((r) => r.rating === star).length
    }));
    res.json({ rating, distribution, count: items.length, items });
  })
);

reviewsRouter.post(
  '/locations/:locationId/reviews',
  authRequired,
  validate(createSchema),
  asyncH(async (req, res) => {
    const location = store.locations.get(req.params.locationId);
    if (!location) throw ApiError.notFound('Məkan tapılmadı');
    const review = {
      id: store.id('r'),
      locationId: location.id,
      userId: req.user.id,
      rating: req.body.rating,
      text: req.body.text,
      visitYear: req.body.visitYear,
      createdAt: new Date().toISOString()
    };
    store.reviews.set(review.id, review);
    store.persist();
    res.status(201).json({ item: serializeReview(review), rating: store.ratingFor(location.id) });
  })
);

reviewsRouter.delete(
  '/reviews/:id',
  authRequired,
  asyncH(async (req, res) => {
    const review = store.reviews.get(req.params.id);
    if (!review) throw ApiError.notFound('Rəy tapılmadı');
    const isOwner = review.userId === req.user.id;
    const isStaff = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isStaff) throw ApiError.forbidden('Yalnız öz rəyinizi silə bilərsiniz');
    store.reviews.delete(review.id);
    store.persist();
    res.status(204).end();
  })
);
