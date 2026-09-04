/**
 * Per-account brute-force protection.
 *
 * The IP rate limiter alone is not enough: an attacker with a pool of
 * addresses spreads attempts thinly across IPs while hammering a single
 * account. This tracks failures per account and makes each further attempt
 * progressively more expensive, regardless of where it comes from.
 *
 * Counters live in memory — correct for the single instance this runs on.
 * Behind more than one instance the store has to move to Redis, or each
 * instance only sees its own share of the attempts.
 */
const attempts = new Map(); // email → { count, blockedUntil }

/** Failures allowed before the first lock-out. */
const FREE_ATTEMPTS = 5;
/** Lock duration grows with each further failure, capped to keep support sane. */
const STEPS_MS = [60_000, 5 * 60_000, 15 * 60_000, 30 * 60_000];
/** Forget an account after this long with no failures. */
const TTL_MS = 60 * 60_000;

const key = (email) => String(email || '').trim().toLowerCase();

function sweep() {
  const now = Date.now();
  for (const [k, v] of attempts) {
    if (now - v.lastSeen > TTL_MS) attempts.delete(k);
  }
}

/** Seconds the caller must wait, or 0 when the attempt may proceed. */
export function retryAfter(email) {
  const rec = attempts.get(key(email));
  if (!rec?.blockedUntil) return 0;
  const left = rec.blockedUntil - Date.now();
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

export function recordFailure(email) {
  const k = key(email);
  const rec = attempts.get(k) ?? { count: 0, blockedUntil: 0, lastSeen: 0 };
  rec.count += 1;
  rec.lastSeen = Date.now();
  if (rec.count > FREE_ATTEMPTS) {
    const step = Math.min(rec.count - FREE_ATTEMPTS - 1, STEPS_MS.length - 1);
    rec.blockedUntil = Date.now() + STEPS_MS[step];
  }
  attempts.set(k, rec);
  if (attempts.size > 5000) sweep();
}

/** A correct password clears the account's history. */
export function recordSuccess(email) {
  attempts.delete(key(email));
}

/** Test seam. */
export function _reset() {
  attempts.clear();
}
