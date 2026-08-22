import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const ROOT = 'e:/ANTIGRAVITY/akcni-letenky-com';
const SKIP = ['node_modules', '.git', '_core/types', 'drizzle/meta', '.manus', 'dist'];
const results = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (SKIP.some(s => rel.startsWith(s) || rel.includes('/' + s))) continue;
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(name)) {
      const lines = readFileSync(full, 'utf8').split('\n').length;
      results.push({ lines, rel });
    }
  }
}
walk(ROOT);
results.sort((a, b) => b.lines - a.lines);
console.log('TOP 45 LARGEST TS/TSX FILES:');
for (const r of results.slice(0, 45)) console.log(String(r.lines).padStart(6), r.rel);
console.log('\nTOTAL FILES:', results.length);
console.log('TOTAL LINES:', results.reduce((s, r) => s + r.lines, 0));
