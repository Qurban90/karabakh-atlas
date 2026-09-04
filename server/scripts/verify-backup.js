/**
 * Proves the backup pair actually works, without touching the real database.
 *
 * Takes a backup, restores it into a scratch database, and compares row
 * counts. Run it on a schedule: a backup that has never been restored is an
 * assumption, and the moment you need it is the wrong moment to find out.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (args, env) =>
  execFileSync(process.execPath, args, { cwd: rootDir, env: { ...process.env, ...env }, encoding: 'utf8' });

const scratch = process.env.VERIFY_DATABASE_URL;
if (!scratch) {
  console.error('[verify] set VERIFY_DATABASE_URL to a throwaway database, e.g.');
  console.error('[verify]   VERIFY_DATABASE_URL=postgres://qdx@localhost:5433/qdx_verify npm run backup:verify');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(rootDir, 'backups', '.verify-'));
try {
  console.log(run(['scripts/backup.js', '--out', tmp]).trim());
  const file = path.join(tmp, fs.readdirSync(tmp)[0]);
  const expected = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString('utf8')).counts;

  console.log(run(['scripts/restore.js', file, '--yes'], { DATABASE_URL: scratch }).trim());

  const check = run(['-e', `
    process.env.DATABASE_URL = ${JSON.stringify(scratch)};
    const { getPool, closePool } = await import('./src/db.js');
    const out = {};
    for (const t of ['users','locations','reviews','posts','checkins','qdx_meta'])
      out[t] = (await getPool().query('SELECT count(*)::int n FROM ' + t)).rows[0].n;
    console.log(JSON.stringify(out));
    await closePool();
  `.replace(/\n\s*/g, ' ')]);
  const actual = JSON.parse(check.trim().split('\n').pop());

  const mismatch = Object.keys(expected).filter((t) => expected[t] !== actual[t]);
  if (mismatch.length) {
    console.error('[verify] MISMATCH in', mismatch.join(', '));
    console.error('[verify] expected', expected, 'got', actual);
    process.exit(1);
  }
  console.log('[verify] restore matches the backup exactly:', JSON.stringify(actual));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
