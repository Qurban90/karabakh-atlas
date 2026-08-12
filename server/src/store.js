import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';
import { hashPassword } from './lib/passwords.js';
import { locationsSeed } from './data/locations.data.js';
import { timelineSeed } from './data/timeline.data.js';
import { revivalIndexSeed } from './data/analytics.data.js';
import { usersSeed, reviewsSeed, postsSeed, checkinsSeed } from './data/community.data.js';

/**
 * In-memory data store with JSON write-through persistence.
 * Static reference data (locations, timeline, revival index) always comes from
 * seed files; community data (users, reviews, posts, check-ins) is persisted
 * to data/runtime-db.json so it survives restarts. Swap for Postgres/PostGIS
 * in production — the module API is repository-shaped on purpose.
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
    this._saveTimer = null;
  }

  id(prefix) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  init() {
    // static reference data
    for (const loc of locationsSeed) this.locations.set(loc.id, { ...loc });
    this.timeline = timelineSeed.map((e) => ({ ...e }));
    this.revivalIndex = revivalIndexSeed.map((e) => ({ ...e }));

    if (this._loadPersisted()) {
      console.log('[qdx] community data loaded from persistence file');
      return;
    }
    // seed community data (hash seed passwords at boot)
    for (const u of usersSeed) {
      const { password, ...rest } = u;
      this.users.set(u.id, { ...rest, passwordHash: hashPassword(password) });
    }
    for (const r of reviewsSeed) this.reviews.set(r.id, { ...r });
    for (const p of postsSeed) this.posts.set(p.id, { ...p, likes: [...p.likes], comments: p.comments.map((c) => ({ ...c })) });
    for (const c of checkinsSeed) this.checkins.set(c.id, { ...c });
    this.persist();
  }

  _loadPersisted() {
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

  /** Debounced write-through — cheap enough for a demo-scale dataset. */
  persist() {
    if (!config.persistEnabled) return;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
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
    }, 300);
    this._saveTimer.unref?.();
  }

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
store.init();
