import { ApiError } from './errors.js';

/**
 * Zod-powered request validation middleware.
 * validate(schema)            → validates req.body
 * validate(schema, 'query')   → validates req.query
 * validate(schema, 'params')  → validates req.params
 * Parsed (and coerced) values replace the original object.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message
      }));
      return next(ApiError.badRequest('Doğrulama xətası', details));
    }
    req[source] = result.data;
    next();
  };
}
