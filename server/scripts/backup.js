/**
 * Logical backup of the community data (users, reviews, posts, check-ins).
 *
 * Deliberately not pg_dump: this runs wherever Node runs, including a Render
 * instance that has no postgres client binaries. The dataset is small and the
 * schema is recreated from code, so a logical row export restores faithfully.
 * For byte-exact, whole-cluster backups use pg_dump (see .github/workflows).
 *
 *   node scripts/backup.js            → backups/qdx-<timestamp>.json.gz
 *   node scripts/backup.js --out DIR  → somewhere else
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { getPool, closePool } from '../src/db.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TABLES = ['users', 'locations', 'reviews', 'posts', 'checkins', 'qdx_meta'];
/** Backups older than this are pruned, so a cron job cannot fill the disk. */
const KEEP = Number(process.env.BACKUP_KEEP || 14);

function outDir() {
  const i = process.argv.indexOf('--out');
  return i > -1 ? process.argv[i + 1] : path.join(rootDir, 'backups');
}

async function main() {
  if (!config.databaseUrl) {
    console.error('[backup] DATABASE_URL is not set — nothing to back up.');
    process.exit(1);
  }

  const pool = getPool();
  const data = {};
  for (const table of TABLES) {
    const res = await pool.query(`SELECT * FROM ${table}`); // fixed identifiers, no user input
    data[table] = res.rows;
  }

  const payload = {
    takenAt: new Date().toISOString(),
    // Passwords are already scrypt hashes; the file is still sensitive because
    // it contains every e-mail address, so treat it as personal data.
    contains: 'hashed credentials and personal data — store encrypted',
    counts: Object.fromEntries(TABLES.map((t) => [t, data[t].length])),
    data
  };

  const dir = outDir();
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const file = path.join(dir, `qdx-${stamp}.json.gz`);
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(payload)));

  const kept = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('qdx-') && f.endsWith('.json.gz'))
    .sort()
    .reverse();
  for (const stale of kept.slice(KEEP)) fs.unlinkSync(path.join(dir, stale));

  console.log(`[backup] ${file}  (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
  console.log(`[backup] rows: ${JSON.stringify(payload.counts)}`);
  console.log(`[backup] keeping ${Math.min(kept.length, KEEP)} of ${kept.length} backups`);
  await closePool();
}

main().catch(async (err) => {
  console.error('[backup] FAILED:', err.message);
  await closePool();
  process.exit(1);
});
