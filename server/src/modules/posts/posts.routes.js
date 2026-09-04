import { Router } from 'express';
import { z } from 'zod';
import { store } from '../../store.js';
import { validate } from '../../lib/validate.js';
import { ApiError, asyncH } from '../../lib/errors.js';
import { authRequired, authOptional, publicUser } from '../../lib/auth.js';
import { locationPhotos } from '../../data/photos.data.js';

export const postsRouter = Router();

const createSchema = z.object({
  text: z.string().min(5, 'Paylaşım ən azı 5 simvol olmalıdır').max(600, 'Paylaşım 600 simvoldan uzun ola bilməz'),
  locationId: z.string().max(60).optional()
});

const commentSchema = z.object({
  text: z.string().min(2, 'Şərh ən azı 2 simvol olmalıdır').max(300, 'Şərh 300 simvoldan uzun ola bilməz')
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0)
});

function serializePost(post, currentUser) {
  const location = post.locationId ? store.locations.get(post.locationId) : null;
  return {
    id: post.id,
    text: post.text,
    createdAt: post.createdAt,
    user: publicUser(store.users.get(post.userId)),
    location: location
      ? {
          id: location.id,
          name: location.name,
          city: location.city,
          category: location.category,
          photos: locationPhotos[location.id] ?? null
        }
      : null,
    likeCount: post.likes.length,
    likedByMe: currentUser ? post.likes.includes(currentUser.id) : false,
    comments: post.comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      user: publicUser(store.users.get(c.userId))
    }))
  };
}

postsRouter.get(
  '/',
  authOptional,
  validate(listQuerySchema, 'query'),
  asyncH(async (req, res) => {
    const { limit, offset } = req.query;
    const all = [...store.posts.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const items = all.slice(offset, offset + limit).map((p) => serializePost(p, req.user));
    res.json({ total: all.length, limit, offset, hasMore: offset + limit < all.length, items });
  })
);

postsRouter.post(
  '/',
  authRequired,
  validate(createSchema),
  asyncH(async (req, res) => {
    if (req.body.locationId && !store.locations.get(req.body.locationId)) {
      throw ApiError.badRequest('Qeyd olunan məkan mövcud deyil');
    }
    const post = {
      id: store.id('p'),
      userId: req.user.id,
      text: req.body.text,
      locationId: req.body.locationId,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    store.posts.set(post.id, post);
    store.persist();
    res.status(201).json({ item: serializePost(post, req.user) });
  })
);

postsRouter.post(
  '/:id/like',
  authRequired,
  asyncH(async (req, res) => {
    const post = store.posts.get(req.params.id);
    if (!post) throw ApiError.notFound('Paylaşım tapılmadı');
    const idx = post.likes.indexOf(req.user.id);
    if (idx === -1) post.likes.push(req.user.id);
    else post.likes.splice(idx, 1);
    store.persist();
    res.json({ item: serializePost(post, req.user) });
  })
);

postsRouter.post(
  '/:id/comments',
  authRequired,
  validate(commentSchema),
  asyncH(async (req, res) => {
    const post = store.posts.get(req.params.id);
    if (!post) throw ApiError.notFound('Paylaşım tapılmadı');
    post.comments.push({
      id: store.id('c'),
      userId: req.user.id,
      text: req.body.text,
      createdAt: new Date().toISOString()
    });
    store.persist();
    res.status(201).json({ item: serializePost(post, req.user) });
  })
);

postsRouter.delete(
  '/:id',
  authRequired,
  asyncH(async (req, res) => {
    const post = store.posts.get(req.params.id);
    if (!post) throw ApiError.notFound('Paylaşım tapılmadı');
    const isOwner = post.userId === req.user.id;
    const isStaff = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isStaff) throw ApiError.forbidden('Yalnız öz paylaşımınızı silə bilərsiniz');
    store.posts.delete(post.id);
    store.persist();
    res.status(204).end();
  })
);
