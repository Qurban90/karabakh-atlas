/**
 * Restores a backup produced by scripts/backup.js.
 *
 * A backup nobody has restored is a guess, not a backup — this is the other
 * half, and `npm run backup:verify` exercises the pair end to end.
 *
 *   node scripts/restore.js backups/qdx-....json.gz [--yes]
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import { config } from '../src/config.js';
import { getPool, closePool, initSchema } from '../src/db.js';

const TABLES = ['locations', 'users', 'reviews', 'posts', 'checkins', 'qdx_meta'];

async function main() {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error('usage: node scripts/restore.js <backup.json.gz> [--yes]');
    process.exit(1);
  }
  if (!config.databaseUrl) {
    console.error('[restore] DATABASE_URL is not set.');
    process.exit(1);
  }
  if (!process.argv.includes('--yes')) {
    console.error('[restore] This REPLACES every row in the target database.');
    console.error('[restore] Re-run with --yes once you are sure of the target.');
    process.exit(1);
  }

  const payload = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'));
  console.log(`[restore] from ${file} taken ${payload.takenAt}`);

  await initSchema();
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE users, locations, reviews, posts, checkins, qdx_meta');
    for (const table of TABLES) {
      const rows = payload.data[table] ?? [];
      for (const row of rows) {
        const cols = Object.keys(row);
        const params = cols.map((_, i) => `$${i + 1}`).join(',');
        await client.query(
          `INSERT INTO ${table} (${cols.join(',')}) VALUES (${params})`,
          cols.map((c) => (row[c] !== null && typeof row[c] === 'object' ? JSON.stringify(row[c]) : row[c]))
        );
      }
      console.log(`[restore] ${table}: ${rows.length}`);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  console.log('[restore] done');
  await closePool();
}

main().catch(async (err) => {
  console.error('[restore] FAILED:', err.message);
  await closePool();
  process.exit(1);
});
