/** Centralized error model + Express error middleware. */

import { redactError } from './redact.js';

export class ApiError extends Error {
  constructor(status, message, code = 'ERROR', details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(message = 'Yanlış sorğu', details) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Giriş tələb olunur') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Bu əməliyyat üçün icazəniz yoxdur') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Tapılmadı') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message = 'Konflikt', details) {
    return new ApiError(409, message, 'CONFLICT', details);
  }
}

/** Wraps async route handlers so rejections reach the error middleware. */
export const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Marşrut tapılmadı: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (status >= 500) {
    // Never log the raw error: a pg failure carries the whole connection string.
    console.error(`[qdx] ${req.method} ${req.originalUrl} →`, redactError(err));
  }

  // Any 5xx gets a fixed message. Deciding this on `!err.status` used to let an
  // explicitly-thrown 500 ship its internal text — driver errors, paths, SQL —
  // straight to the client.
  const isServerFault = status >= 500;

  res.status(status).json({
    error: {
      code: err.code || (isServerFault ? 'INTERNAL' : 'ERROR'),
      message: isServerFault ? 'Daxili server xətası' : err.message,
      // details come from our own zod validation, never from a driver
      ...(!isServerFault && err.details ? { details: err.details } : {})
    }
  });
}
