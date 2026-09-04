import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';
import { hashPassword } from './lib/passwords.js';
import { redact } from './lib/redact.js';
import { initSchema, getMeta, syncAll, loadAll } from './db.js';
import { locationsSeed } from './data/locations.data.js';
import { timelineSeed } from './data/timeline.data.js';
import { revivalIndexSeed } from './data/analytics.data.js';
import { usersSeed, reviewsSeed, postsSeed, checkinsSeed } from './data/community.data.js';

/**
 * Data store: an in-memory working set (demo-scale dataset) persisted to
 * **Postgres** when DATABASE_URL is set — hydrated at boot, transactionally
 * synced on every debounced persist(). Falls back to a JSON file when no
 * database is configured/reachable, so `npm run dev` works with zero setup.
 *
 * Bump SEED_VERSION after editing seed files to rebuild persisted data.
 */
const SEED_VERSION = 3;

class Store {
  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.reviews = new Map();
    this.posts = new Map();
    this.checkins = new Map();
    this.timeline = [];
    this.revivalIndex = [];
    /** 'postgres' | 'json' — reported by /api/health */
    this.backend = 'json';
    this._saveTimer = null;
  }

  id(prefix) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  async init() {
    // static reference data always comes from code
    this.timeline = timelineSeed.map((e) => ({ ...e }));
    this.revivalIndex = revivalIndexSeed.map((e) => ({ ...e }));

    if (config.databaseUrl) {
      try {
        await this._initPostgres();
        this.backend = 'postgres';
        this._refreshStaffPasswords();
        console.log('[qdx] persistence: Postgres');
        return;
      } catch (err) {
        // Falling back is a convenience for local development. In production it
        // would silently trade a real database for an ephemeral file — the app
        // would look healthy while every write is one restart from being lost.
        if (config.isProd) {
          console.error('[qdx] FATAL: DATABASE_URL is set but Postgres is unavailable:', redact(err.message));
          console.error('       Refusing to start on the JSON fallback in production.');
          process.exit(1);
        }
        console.warn('[qdx] Postgres unreachable, falling back to JSON file:', redact(err.message));
      }
    }
    this._initJson();
    this.backend = 'json';
    this._refreshStaffPasswords();
    console.log('[qdx] persistence: JSON file (set DATABASE_URL for Postgres)');
  }

  /**
   * Re-derives staff passwords on every boot, after data is loaded.
   *
   * Without this, a store seeded by an older build keeps the password hash it
   * was seeded with — so a previously published seed password would survive in
   * Postgres (or the JSON file) forever, which is exactly the backdoor this is
   * meant to close. Re-deriving costs nothing and needs no destructive reseed.
   */
  _refreshStaffPasswords() {
    for (const user of this.users.values()) {
      if (user.role === 'user') continue;
      const seed = usersSeed.find((u) => u.id === user.id) || user;
      user.passwordHash = hashPassword(this._passwordFor(seed));
    }
  }

  /* ---------- Postgres backend ---------- */

  async _initPostgres() {
    await initSchema();
    const version = await getMeta('seed_version');
    if (version === String(SEED_VERSION)) {
      await loadAll(this);
    } else {
      this._seedCommunity();
      await syncAll(this, SEED_VERSION); // fresh seed → write through
      console.log('[qdx] Postgres seeded (seed version', SEED_VERSION + ')');
    }
  }

  /* ---------- JSON fallback backend ---------- */

  _initJson() {
    for (const loc of locationsSeed) this.locations.set(loc.id, { ...loc });
    if (this._loadPersistedJson()) {
      console.log('[qdx] community data loaded from persistence file');
      return;
    }
    this._seedCommunityUsers();
    for (const r of reviewsSeed) this.reviews.set(r.id, { ...r });
    for (const p of postsSeed) this.posts.set(p.id, { ...p, likes: [...p.likes], comments: p.comments.map((c) => ({ ...c })) });
    for (const c of checkinsSeed) this.checkins.set(c.id, { ...c });
    this.persist();
  }

  _seedCommunity() {
    for (const loc of locationsSeed) this.locations.set(loc.id, { ...loc });
    this._seedCommunityUsers();
    for (const r of reviewsSeed) this.reviews.set(r.id, { ...r });
    for (const p of postsSeed) this.posts.set(p.id, { ...p, likes: [...p.likes], comments: p.comments.map((c) => ({ ...c })) });
    for (const c of checkinsSeed) this.checkins.set(c.id, { ...c });
  }

  _seedCommunityUsers() {
    for (const u of usersSeed) {
      const { password, ...rest } = u;
      this.users.set(u.id, { ...rest, passwordHash: hashPassword(this._passwordFor(u)) });
    }
  }

  /**
   * Staff accounts (admin/moderator) can delete anyone's content, so they never
   * get a password from the seed files — those are public, this repo ships
   * them. The password comes from ADMIN_PASSWORD / MODERATOR_PASSWORD, and
   * with no env var set a random one is generated and printed once to the
   * server log. This holds in every environment, development included: a
   * dev-only shortcut is exactly the kind of thing that reaches production.
   */
  _passwordFor(user) {
    if (user.role === 'user') return user.password;
    const envName = `${user.role.toUpperCase()}_PASSWORD`;
    const fromEnv = config.staffPasswords[user.role];
    if (fromEnv) return fromEnv;
    const generated = crypto.randomBytes(12).toString('base64url');
    console.warn(`[qdx] ${envName} is not set — one-off password for ${user.email}: ${generated}`);
    console.warn(`      Set ${envName} in the environment to choose your own.`);
    return generated;
  }

  _loadPersistedJson() {
    if (!config.persistEnabled) return false;
    try {
      if (!fs.existsSync(config.persistFile)) return false;
      const raw = JSON.parse(fs.readFileSync(config.persistFile, 'utf8'));
      if (raw.version !== SEED_VERSION) return false; // seed changed → rebuild
      for (const u of raw.users) this.users.set(u.id, u);
      for (const r of raw.reviews) this.reviews.set(r.id, r);
      for (const p of raw.posts) this.posts.set(p.id, p);
      for (const c of raw.checkins) this.checkins.set(c.id, c);
      return true;
    } catch (err) {
      console.warn('[qdx] persistence file unreadable, reseeding:', err.message);
      return false;
    }
  }

  /* ---------- write-through (debounced, both backends) ---------- */

  persist() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      if (this.backend === 'postgres') {
        syncAll(this, SEED_VERSION).catch((err) =>
          console.warn('[qdx] Postgres sync failed:', redact(err.message))
        );
      } else {
        this._persistJson();
      }
    }, 300);
    this._saveTimer.unref?.();
  }

  _persistJson() {
    if (!config.persistEnabled) return;
    try {
      fs.mkdirSync(path.dirname(config.persistFile), { recursive: true });
      fs.writeFileSync(
        config.persistFile,
        JSON.stringify(
          {
            version: SEED_VERSION,
            savedAt: new Date().toISOString(),
            users: [...this.users.values()],
            reviews: [...this.reviews.values()],
            posts: [...this.posts.values()],
            checkins: [...this.checkins.values()]
          },
          null,
          2
        )
      );
    } catch (err) {
      console.warn('[qdx] persist failed:', err.message);
    }
  }

  /* ---------- queries ---------- */

  findUserByEmail(email) {
    const needle = String(email).toLowerCase();
    for (const u of this.users.values()) if (u.email.toLowerCase() === needle) return u;
    return null;
  }

  reviewsForLocation(locationId) {
    return [...this.reviews.values()]
      .filter((r) => r.locationId === locationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  ratingFor(locationId) {
    const list = this.reviewsForLocation(locationId);
    if (!list.length) return { average: 0, count: 0 };
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
  }

  checkinsForUser(userId) {
    return [...this.checkins.values()]
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const store = new Store();
