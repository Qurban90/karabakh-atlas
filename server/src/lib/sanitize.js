/**
 * Input sanitization: strips HTML tags / angle brackets from every string in
 * the request body to neutralize stored-XSS payloads. Runs before validation.
 */
function cleanString(value) {
  return value
    .replace(/<[^>]*>/g, '')  // drop complete tags
    .replace(/[<>]/g, '')     // drop stray angle brackets
    .replace(/\0/g, '')       // drop null bytes
    .trim();
}

function deepClean(value) {
  if (typeof value === 'string') return cleanString(value);
  if (Array.isArray(value)) return value.map(deepClean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepClean(v);
    return out;
  }
  return value;
}

export function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepClean(req.body);
  }
  next();
}
