import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/** Minimal .env parser — avoids a dotenv dependency. Existing process.env wins. */
function loadEnvFile(file) {
  const full = path.join(rootDir, file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';
loadEnvFile(`.env.${NODE_ENV}`);
loadEnvFile('.env');

export const config = {
  env: NODE_ENV,
  isProd: NODE_ENV === 'production',
  port: Number(process.env.PORT || 5001),
  jwtSecret: process.env.JWT_SECRET || 'qdx-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rate: {
    windowMs: Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_MAX || 600),
    authMax: Number(process.env.RATE_AUTH_MAX || 30),
    writeMax: Number(process.env.RATE_WRITE_MAX || 150)
  },
  /** Optional path for JSON write-through persistence (kept off in tests). */
  persistFile: process.env.PERSIST_FILE || path.join(rootDir, 'data', 'runtime-db.json'),
  persistEnabled: process.env.PERSIST !== 'off'
};

if (config.isProd && config.jwtSecret === 'qdx-dev-secret-change-me') {
  console.warn('[qdx] WARNING: set a strong JWT_SECRET in production (.env.production).');
}
