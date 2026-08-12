/** Syntax-checks every .js file under src/ (node --check). Exits non-zero on failure. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

let failed = 0;
for (const file of walk(srcDir)) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed += 1;
    console.error(`✗ ${path.relative(srcDir, file)}\n${err.stderr}`);
  }
}
const total = walk(srcDir).length;
if (failed) {
  console.error(`${failed}/${total} files failed syntax check`);
  process.exit(1);
}
console.log(`✓ ${total} server files pass syntax check`);
