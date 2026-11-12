// Автономный локальный сервер АКВТ (сайт + админка + прямое сохранение на диск)
// Запуск: node server.mjs
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(process.argv[2] || __dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// Репозиторий в памяти с синхронизацией на диск
const load = () => {
  const m = new Map();
  (function walk(d) {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      if (f.name === '.git' || f.name === 'node_modules') continue;
      const p = path.join(d, f.name);
      if (f.isDirectory()) walk(p);
      else m.set(path.relative(ROOT, p).split(path.sep).join('/'), fs.readFileSync(p));
    }
  })(ROOT);
  return m;
};

let n = 0;
const id = () => (++n).toString(16).padStart(40, '0');
const blobs = new Map();
const trees = new Map();
const commits = new Map();
const t0 = id();
trees.set(t0, load());
const c0 = id();
commits.set(c0, { sha: c0, message: 'initial', tree: t0, parents: [], date: new Date().toISOString() });
let head = c0;
const log = [c0];
const stats = { requests: 0, commits: 0 };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
};

const json = (res, code, obj) => {
  res.writeHead(code, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

const body = (req) =>
  new Promise((r) => {
    const c = [];
    req.on('data', (d) => c.push(d));
    req.on('end', () => r(c.length ? JSON.parse(Buffer.concat(c).toString()) : {}));
  });

// Обработчик локального Git Data API (эмуляция GitHub API с записью на диск)
async function handleApi(req, res, pathname, u) {
  stats.requests++;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  const p = pathname;
  const m = /^\/repos\/[^/]+\/[^/]+(\/.*)?$/.exec(p);
  const sub = m ? m[1] || '' : p;
  const curTree = () => trees.get(commits.get(head).tree);

  try {
    if (p === '/__stats') return json(res, 200, { ...stats, head, log: log.map((s) => commits.get(s).message) });
    if (p === '/user') return json(res, 200, { login: 'Локальный администратор', name: 'AKVT Admin' });
    if (sub === '') return json(res, 200, { permissions: { push: true, admin: true } });
    if (sub.startsWith('/branches/')) return json(res, 200, { name: 'main' });
    if (sub.startsWith('/contents/')) {
      const file = decodeURIComponent(sub.slice(10));
      const buf = curTree().get(file);
      if (!buf) return json(res, 404, { message: 'Not Found' });
      res.writeHead(200, { ...cors, 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(buf);
    }
    if (sub.startsWith('/git/trees/') && req.method === 'GET') {
      return json(res, 200, {
        tree: [...curTree()].map(([pa, b]) => ({ path: pa, type: 'blob', size: b.length })),
        truncated: false,
      });
    }
    if (sub === '/git/ref/heads/main' || sub.startsWith('/git/refs/heads/')) {
      if (req.method === 'GET') {
        return json(res, 200, { object: { sha: head } });
      }
      if (req.method === 'PATCH') {
        const b = await body(req);
        const c = commits.get(b.sha);
        if (c && c.parents[0] && c.parents[0] !== head) {
          // разрешаем мягкий fast-forward в локальном режиме
        }
        // применяем изменения прямо на диск
        const prev = curTree();
        const next = trees.get(c.tree);
        let changedCount = 0;
        for (const [pa, buf] of next) {
          if (!prev.has(pa) || !prev.get(pa).equals(buf)) {
            const f = path.join(ROOT, pa);
            fs.mkdirSync(path.dirname(f), { recursive: true });
            fs.writeFileSync(f, buf);
            changedCount++;
          }
        }
        for (const pa of prev.keys()) {
          if (!next.has(pa)) {
            const f = path.join(ROOT, pa);
            if (fs.existsSync(f)) {
              fs.rmSync(f, { force: true });
              changedCount++;
            }
          }
        }
        head = b.sha;
        log.unshift(b.sha);
        stats.commits++;
        console.log(`[АКВТ Сохранение] Коммит «${c.message}»: обновлено ${changedCount} файлов на диске`);
        return json(res, 200, { ref: 'refs/heads/main' });
      }
    }
    if (sub.startsWith('/git/commits/') && req.method === 'GET') {
      const sha = sub.split('/').pop();
      const commit = commits.get(sha) || commits.get(head);
      return json(res, 200, { tree: { sha: commit.tree } });
    }
    if (sub === '/git/blobs') {
      const b = await body(req);
      const k = id();
      blobs.set(k, Buffer.from(b.content, 'base64'));
      return json(res, 201, { sha: k });
    }
    if (sub === '/git/trees') {
      const b = await body(req);
      const t = new Map(trees.get(b.base_tree) || curTree());
      for (const e of b.tree) {
        if (e.sha === null) t.delete(e.path);
        else if (e.content != null) t.set(e.path, Buffer.from(e.content));
        else if (blobs.has(e.sha)) t.set(e.path, blobs.get(e.sha));
      }
      const k = id();
      trees.set(k, t);
      return json(res, 201, { sha: k });
    }
    if (sub === '/git/commits' && req.method === 'POST') {
      const b = await body(req);
      const k = id();
      commits.set(k, {
        sha: k,
        message: b.message,
        tree: b.tree,
        parents: b.parents || [head],
        date: new Date().toISOString(),
      });
      return json(res, 201, { sha: k, html_url: `#/history` });
    }
    if (sub.startsWith('/commits')) {
      const per = +u.searchParams.get('per_page') || 20;
      const only = u.searchParams.get('path');
      let list = log.map((s) => commits.get(s));
      if (only) {
        list = list.filter((c, i) => {
          const par = commits.get(c.parents[0]);
          return (
            !par ||
            !trees
              .get(c.tree)
              ?.get(only)
              ?.equals?.(trees.get(par.tree)?.get(only) || Buffer.alloc(0))
          );
        });
      }
      return json(
        res,
        200,
        list.slice(0, per).map((c) => ({
          sha: c.sha,
          html_url: `#/history`,
          commit: {
            message: c.message,
            author: { name: 'Локальный администратор', date: c.date },
          },
        }))
      );
    }
    return json(res, 404, { message: 'unhandled ' + req.method + ' ' + p });
  } catch (e) {
    console.error('[API Error]', e);
    return json(res, 500, { message: String(e) });
  }
}

// Обработчик статики
function handleStatic(req, res, pathname) {
  let p = pathname;
  if (p === '/admin') p = '/admin/';

  const cand = [];
  if (p.startsWith('/admin')) {
    cand.push(path.join(ROOT, p.endsWith('/') ? p + 'index.html' : p));
  }
  const rel = p.endsWith('/') ? p + 'index.html' : p;
  cand.push(path.join(ROOT, 'site', rel));
  cand.push(path.join(ROOT, rel));

  const f = cand.find((x) => fs.existsSync(x) && fs.statSync(x).isFile());
  if (!f) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Не найдено');
  }

  const ext = path.extname(f).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
    ...cors,
  });
  fs.createReadStream(f).pipe(res);
}

// Главный объединенный сервер на порту 8790
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://' + (req.headers.host || 'localhost:8790'));
  const pathname = decodeURIComponent(u.pathname);

  // Если это запрос к API (локальный GitHub / git data api)
  if (
    pathname.startsWith('/repos/') ||
    pathname === '/user' ||
    pathname.startsWith('/git/') ||
    pathname === '/__stats'
  ) {
    return handleApi(req, res, pathname, u);
  }

  // Иначе раздаем статику (сайт или админку)
  return handleStatic(req, res, pathname);
});

const PORT = 8790;
server.listen(PORT, () => {
  console.log('================================================================');
  console.log('  АКВТ ЛОКАЛЬНЫЙ СЕРВЕР ЗАПУЩЕН!');
  console.log(`  Сайт:          http://localhost:${PORT}/`);
  console.log(`  Админ-панель:  http://localhost:${PORT}/admin/`);
  console.log('  Режим:         Автономный (прямое сохранение на локальный диск)');
  console.log('  GitHub:        Не требуется (все операции пишутся напрямую в файлы)');
  console.log('================================================================');
});

// Дополнительный сервер на порту 8788 для обратной совместимости с тестовым стендом
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:8788');
  return handleApi(req, res, decodeURIComponent(u.pathname), u);
}).listen(8788);
