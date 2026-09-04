import pg from 'pg';
import { config } from './config.js';

/**
 * Postgres persistence layer.
 *
 * The store keeps the working set in memory (it is tiny — a demo-scale
 * dataset) and treats Postgres as the source of truth: hydrated at boot,
 * synced transactionally on every debounced persist(). This keeps all route
 * code synchronous while making data survive restarts/redeploys — exactly
 * the gap the Render free tier's ephemeral disk exposed.
 */

let pool = null;

export function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      max: 5,
      connectionTimeoutMillis: 5000,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined
    });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS qdx_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',
  avatar_hue    INT  NOT NULL DEFAULT 260,
  joined_at     TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS locations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  category     TEXT NOT NULL,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  visible_from INT NOT NULL,
  data         JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT NOT NULL,
  visit_year  INT,
  created_at  TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL,
  likes       JSONB NOT NULL DEFAULT '[]',
  comments    JSONB NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS checkins (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  method      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, location_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_location ON reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user   ON checkins(user_id);
`;

/** True when the tables this app needs already exist. */
export async function schemaReady() {
  const res = await getPool().query(
    `SELECT count(*)::int AS n FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name IN ('users','locations','reviews','posts','checkins','qdx_meta')`
  );
  return res.rows[0]?.n === 6;
}

/**
 * Creates the schema when the connected role is allowed to.
 *
 * A least-privilege runtime role (see db/roles.sql) has no CREATE on the
 * schema, so this will be refused — which is fine as long as the migration
 * role has already created the tables. It is only fatal when the schema is
 * genuinely missing and we cannot create it.
 */
export async function initSchema() {
  try {
    await getPool().query(SCHEMA_SQL);
  } catch (err) {
    const denied = err?.code === '42501'; // insufficient_privilege
    if (!denied) throw err;
    if (await schemaReady()) {
      console.log('[qdx] no DDL rights (least-privilege role) — schema already present, continuing');
      return;
    }
    throw new Error(
      'no permission to create the schema and it does not exist yet — ' +
        'run db/roles.sql and apply the schema as the migration role first'
    );
  }
}

export async function getMeta(key) {
  const res = await getPool().query('SELECT value FROM qdx_meta WHERE key = $1', [key]);
  return res.rows[0]?.value ?? null;
}

async function setMeta(client, key, value) {
  await client.query(
    'INSERT INTO qdx_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [key, String(value)]
  );
}

/** Identifiers this helper is ever allowed to build SQL from. */
const TABLES = new Set(['users', 'locations', 'reviews', 'posts', 'checkins']);
const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

/**
 * Multi-row INSERT helper: rows = array of param-arrays.
 *
 * Values always travel as $n parameters — they are never concatenated into
 * the statement. Table and column names cannot be parameterised by the
 * protocol, so they are checked against a fixed list instead: today every
 * caller passes a literal, and this makes sure a future one cannot pass
 * something a user influenced.
 */
async function bulkInsert(client, table, columns, rows) {
  if (!TABLES.has(table)) throw new Error(`refusing to build SQL for unknown table: ${table}`);
  for (const col of columns) {
    if (!IDENTIFIER.test(col)) throw new Error(`refusing to build SQL for unsafe column: ${col}`);
  }
  if (!rows.length) return;
  const params = [];
  const tuples = rows.map((row) => {
    const placeholders = row.map((value) => {
      params.push(value);
      return `$${params.length}`;
    });
    return `(${placeholders.join(',')})`;
  });
  await client.query(`INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`, params);
}

/**
 * Writes the entire in-memory state to Postgres in one transaction.
 * Dataset is tiny (tens of rows), so full replace is both simplest and
 * atomic — it also captures in-place mutations (likes, comments, admin
 * edits) without per-entity change tracking.
 */
export async function syncAll(store, seedVersion) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE users, locations, reviews, posts, checkins');

    await bulkInsert(
      client,
      'locations',
      ['id', 'name', 'city', 'category', 'lat', 'lng', 'visible_from', 'data'],
      [...store.locations.values()].map((l) => [l.id, l.name, l.city, l.category, l.lat, l.lng, l.visibleFrom, JSON.stringify(l)])
    );
    await bulkInsert(
      client,
      'users',
      ['id', 'name', 'email', 'password_hash', 'role', 'avatar_hue', 'joined_at'],
      [...store.users.values()].map((u) => [u.id, u.name, u.email, u.passwordHash, u.role, u.avatarHue, u.joinedAt])
    );
    await bulkInsert(
      client,
      'reviews',
      ['id', 'location_id', 'user_id', 'rating', 'text', 'visit_year', 'created_at'],
      [...store.reviews.values()].map((r) => [r.id, r.locationId, r.userId, r.rating, r.text, r.visitYear ?? null, r.createdAt])
    );
    await bulkInsert(
      client,
      'posts',
      ['id', 'user_id', 'location_id', 'text', 'created_at', 'likes', 'comments'],
      [...store.posts.values()].map((p) => [p.id, p.userId, p.locationId ?? null, p.text, p.createdAt, JSON.stringify(p.likes), JSON.stringify(p.comments)])
    );
    await bulkInsert(
      client,
      'checkins',
      ['id', 'user_id', 'location_id', 'method', 'created_at'],
      [...store.checkins.values()].map((c) => [c.id, c.userId, c.locationId, c.method, c.createdAt])
    );

    await setMeta(client, 'seed_version', seedVersion);
    await setMeta(client, 'synced_at', new Date().toISOString());
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

/** Hydrates the store's Maps from Postgres. */
export async function loadAll(store) {
  const q = (sql) => getPool().query(sql);
  const [locations, users, reviews, posts, checkins] = await Promise.all([
    q('SELECT data FROM locations'),
    q('SELECT * FROM users'),
    q('SELECT * FROM reviews'),
    q('SELECT * FROM posts'),
    q('SELECT * FROM checkins')
  ]);

  store.locations.clear();
  for (const row of locations.rows) store.locations.set(row.data.id, row.data);

  store.users.clear();
  for (const r of users.rows) {
    store.users.set(r.id, {
      id: r.id,
      name: r.name,
      email: r.email,
      passwordHash: r.password_hash,
      role: r.role,
      avatarHue: r.avatar_hue,
      joinedAt: iso(r.joined_at)
    });
  }

  store.reviews.clear();
  for (const r of reviews.rows) {
    store.reviews.set(r.id, {
      id: r.id,
      locationId: r.location_id,
      userId: r.user_id,
      rating: r.rating,
      text: r.text,
      visitYear: r.visit_year ?? undefined,
      createdAt: iso(r.created_at)
    });
  }

  store.posts.clear();
  for (const r of posts.rows) {
    store.posts.set(r.id, {
      id: r.id,
      userId: r.user_id,
      locationId: r.location_id ?? undefined,
      text: r.text,
      createdAt: iso(r.created_at),
      likes: r.likes,
      comments: r.comments
    });
  }

  store.checkins.clear();
  for (const r of checkins.rows) {
    store.checkins.set(r.id, {
      id: r.id,
      userId: r.user_id,
      locationId: r.location_id,
      method: r.method,
      createdAt: iso(r.created_at)
    });
  }
}
