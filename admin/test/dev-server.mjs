// Тестовый стенд: поддельный GitHub API (:8788) и статический сервер с rewrite как на Vercel (:8790).
//   node admin/test/dev-server.mjs <папка-копии-репозитория>
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(process.argv[2]);
const MIME = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xls': 'application/vnd.ms-excel' };

// ---------- «репозиторий» в памяти: tree = Map(path -> Buffer)
const load = () => { const m = new Map(); (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.name === '.git' || f.name === 'node_modules') continue; const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else m.set(path.relative(ROOT, p).split(path.sep).join('/'), fs.readFileSync(p)); } })(ROOT); return m; };
let n = 0; const id = () => (++n).toString(16).padStart(40, '0');
const blobs = new Map(); const trees = new Map(); const commits = new Map();
const t0 = id(); trees.set(t0, load());
const c0 = id(); commits.set(c0, { sha: c0, message: 'initial', tree: t0, parents: [], date: new Date().toISOString() });
let head = c0; const log = [c0];
const stats = { requests: 0, commits: 0 };

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS' };
const json = (res, code, obj) => { res.writeHead(code, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = (req) => new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(c.length ? JSON.parse(Buffer.concat(c).toString()) : {})); });

http.createServer(async (req, res) => {
  stats.requests++;
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const u = new URL(req.url, 'http://x'); const p = u.pathname;
  const m = /^\/repos\/[^/]+\/[^/]+(\/.*)?$/.exec(p); const sub = m ? m[1] || '' : p;
  const curTree = () => trees.get(commits.get(head).tree);
  try {
    if (p === '/__stats') return json(res, 200, { ...stats, head, log: log.map((s) => commits.get(s).message) });
    if (p === '/user') return json(res, 200, { login: 'tester' });
    if (sub === '') return json(res, 200, { permissions: { push: true } });
    if (sub.startsWith('/branches/')) return json(res, 200, { name: 'main' });
    if (sub.startsWith('/contents/')) {
      const file = decodeURIComponent(sub.slice(10)); const buf = curTree().get(file);
      if (!buf) return json(res, 404, { message: 'Not Found' });
      res.writeHead(200, { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }); return res.end(buf);
    }
    if (sub.startsWith('/git/trees/') && req.method === 'GET') return json(res, 200, { tree: [...curTree()].map(([pa, b]) => ({ path: pa, type: 'blob', size: b.length })), truncated: false });
    if (sub === '/git/ref/heads/main') return json(res, 200, { object: { sha: head } });
    if (sub.startsWith('/git/commits/') && req.method === 'GET') return json(res, 200, { tree: { sha: commits.get(sub.split('/').pop()).tree } });
    if (sub === '/git/blobs') { const b = await body(req); const k = id(); blobs.set(k, Buffer.from(b.content, 'base64')); return json(res, 201, { sha: k }); }
    if (sub === '/git/trees') {
      const b = await body(req); const t = new Map(trees.get(b.base_tree));
      for (const e of b.tree) { if (e.sha === null) t.delete(e.path); else if (e.content != null) t.set(e.path, Buffer.from(e.content)); else t.set(e.path, blobs.get(e.sha)); }
      const k = id(); trees.set(k, t); return json(res, 201, { sha: k });
    }
    if (sub === '/git/commits' && req.method === 'POST') {
      const b = await body(req); const k = id(); commits.set(k, { sha: k, message: b.message, tree: b.tree, parents: b.parents, date: new Date().toISOString() });
      return json(res, 201, { sha: k, html_url: `https://github.test/commit/${k}` });
    }
    if (sub === '/git/refs/heads/main' && req.method === 'PATCH') {
      const b = await body(req); const c = commits.get(b.sha);
      if (c.parents[0] !== head) return json(res, 422, { message: 'Update is not a fast forward' });
      // применяем на диск = «деплой»
      const prev = curTree(); const next = trees.get(c.tree);
      for (const [pa, buf] of next) if (!prev.has(pa) || !prev.get(pa).equals(buf)) { const f = path.join(ROOT, pa); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); }
      for (const pa of prev.keys()) if (!next.has(pa)) fs.rmSync(path.join(ROOT, pa), { force: true });
      head = b.sha; log.unshift(b.sha); stats.commits++; return json(res, 200, { ref: 'refs/heads/main' });
    }
    if (sub.startsWith('/commits')) {
      const per = +u.searchParams.get('per_page') || 20; const only = u.searchParams.get('path');
      let list = log.map((s) => commits.get(s));
      if (only) list = list.filter((c, i) => { const par = commits.get(c.parents[0]); return !par || !trees.get(c.tree).get(only)?.equals?.(trees.get(par.tree).get(only) || Buffer.alloc(0)); });
      return json(res, 200, list.slice(0, per).map((c) => ({ sha: c.sha, html_url: `https://github.test/commit/${c.sha}`, commit: { message: c.message, author: { name: 'tester', date: c.date } } })));
    }
    return json(res, 404, { message: 'unhandled ' + req.method + ' ' + p });
  } catch (e) { console.error(e); return json(res, 500, { message: String(e) }); }
}).listen(8788);

// ---------- статика как на Vercel
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/admin') p = '/admin/';
  const cand = [];
  if (p.startsWith('/admin')) cand.push(path.join(ROOT, p.endsWith('/') ? p + 'index.html' : p));
  const rel = p.endsWith('/') ? p + 'index.html' : p;
  cand.push(path.join(ROOT, 'site', rel));
  const f = cand.find((x) => fs.existsSync(x) && fs.statSync(x).isFile());
  if (!f) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}).listen(8790);
console.log('ready');
