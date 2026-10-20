// Пересобирает admin/pages-index.json по файлам сайта.  node admin/build-index.mjs  (из корня репозитория)
import fs from 'fs'; import path from 'path';
import { titleToIndexEntry, INDEX_PATH } from './core.mjs';
const root = 'site';
const skip = new Set(['wp-content', 'wp-includes', '.web-uplift', 'partials', 'tools', 'node_modules', '_xls-proxy', 'icons']);
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (!skip.has(f.name)) walk(p); }
    else if (f.name === 'index.html') {
      const dir = path.relative(root, d).split(path.sep).join('/');
      pages.push(titleToIndexEntry(dir, fs.readFileSync(p, 'utf8')));
    }
  }
})(root);
pages.sort((a, b) => a.d.localeCompare(b.d));
fs.writeFileSync(INDEX_PATH, JSON.stringify({ generated: new Date().toISOString(), pages }).replace(/\},\{/g, '},\n{') + '\n');
console.log('pages-index.json:', pages.length, 'страниц, из них новостей', pages.filter((p) => p.n).length);
