import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ApiError } from './errors.js';
import { store } from '../store.js';

/* ---------- JWT ---------- */

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

/* ---------- middlewares ---------- */

/** Attaches req.user when a valid token is present; guests pass through. */
export function authOptional(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = store.users.get(payload.sub) || null;
  } catch {
    req.user = null; // invalid/expired token → treat as guest
  }
  next();
}

export function authRequired(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = store.users.get(payload.sub);
    if (!user) return next(ApiError.unauthorized('İstifadəçi tapılmadı'));
    req.user = user;
    next();
  } catch {
    next(ApiError.unauthorized('Token etibarsız və ya vaxtı bitib'));
  }
}

/** RBAC guard — usage: requireRole('admin') or requireRole('admin', 'moderator'). */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

/** Public projection of a user record. */
export function publicUser(user) {
  if (!user) return null;
  const { id, name, role, joinedAt, avatarHue } = user;
  return { id, name, role, joinedAt, avatarHue };
}
