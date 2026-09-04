/**
 * Strips credentials out of anything on its way to a log.
 *
 * The realistic leak here is not a stray console.log of a password — it is an
 * error object. A failed `pg` connection carries the whole DSN, so logging the
 * error verbatim writes `postgres://user:PASSWORD@host` into the platform log,
 * where it long outlives the incident.
 */
const PATTERNS = [
  // postgres://user:secret@host → postgres://user:***@host
  [/\/\/([^:/@\s]+):([^@\s]+)@/g, '//$1:***@'],

  // Authorization headers and bare JWTs
  [/\bBearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, 'Bearer ***'],
  [/\beyJ[\w-]{10,}\.[\w-]+\.[\w-]+/g, '***jwt***'],

  // key=value for anything secret-shaped. The prefix is optional so this
  // catches both `api_key=…` and prefixed names like `JWT_SECRET=…` — a \b
  // boundary misses the latter, because the character before "SECRET" is an
  // underscore, which is itself a word character.
  [
    /([\w-]*(?:password|passwd|pwd|secret|token|api[_-]?key|auth)[\w-]*)(\s*[=:]\s*)("?)([^\s,;"']+)\3/gi,
    '$1$2***'
  ]
];

export function redact(value) {
  let text = typeof value === 'string' ? value : String(value ?? '');
  for (const [re, to] of PATTERNS) text = text.replace(re, to);
  return text;
}

/** Log-safe view of an Error: message + stack, both redacted. */
export function redactError(err) {
  if (!err) return '';
  if (err instanceof Error) return redact(err.stack || `${err.name}: ${err.message}`);
  return redact(err);
}
