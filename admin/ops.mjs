// Операции админки. Каждая «plan…» функция ничего не пишет: возвращает список изменений файлов
// ({path, content} | {path, base64} | {path, delete:true}), которые потом коммитятся одним коммитом.
import * as C from './core.mjs';

const LIST_PAGES = ['archives', 'category/news'];
const FALLBACK_TEMPLATE = 'postupayushhim/obshhezhitie';

export async function loadContext(repo) {
  const [idx, header, footer] = await Promise.all([
    repo.read(C.INDEX_PATH), repo.read(C.HEADER_PARTIAL), repo.read(C.FOOTER_PARTIAL),
  ]);
  if (!idx) throw new Error('Не найден admin/pages-index.json — индекс страниц не создан');
  return { index: JSON.parse(idx), header, footer };
}
export const indexChange = (index) => ({
  path: C.INDEX_PATH,
  content: JSON.stringify({ generated: new Date().toISOString(), pages: index.pages }, null, 0).replace(/\},\{/g, '},\n{') + '\n',
});

/** прочитать набор страниц dir[] -> Map(dir -> html) (отсутствующие пропускаются) */
async function readPages(repo, dirs) {
  const out = new Map();
  await Promise.all(dirs.map(async (d) => { const h = await repo.read(C.siteFile(d)); if (h != null) out.set(d, h); }));
  return out;
}
class Batch {
  constructor() { this.map = new Map(); }
  set(path, content) { this.map.set(path, { path, content }); }
  del(path) { this.map.set(path, { path, delete: true }); }
  get(path) { const v = this.map.get(path); return v && !v.delete ? v.content : undefined; }
  list() { return [...this.map.values()]; }
}
/** читает файл с учётом уже запланированных правок */
async function readB(repo, batch, path) {
  const v = batch.get(path);
  return v !== undefined ? v : repo.read(path);
}

// ------------------------------------------------------------------- сохранение страницы
export async function planSavePage(repo, ctx, { dir, original, inner, fullHtml, title, description }) {
  const b = new Batch();
  const index = structuredClone(ctx.index);
  let out = fullHtml != null ? fullHtml : original;
  const oldTitle = C.getTitle(original);
  if (fullHtml == null && inner != null) out = C.setEditable(out, inner);
  if (description != null && description !== C.getDescription(out)) out = C.setDescription(out, description);
  const titleChanged = title != null && title.trim() !== '' && title !== oldTitle;
  if (titleChanged) out = C.setTitle(out, title, oldTitle, dir === '' ? '' : C.BRAND);
  out = C.syncChrome(out, dir, ctx.header, ctx.footer);
  if (out !== original) b.set(C.siteFile(dir), out);

  const entry = index.pages.find((p) => p.d === dir);
  if (titleChanged) {
    if (entry) entry.t = title;
    if (entry && entry.n) {
      for (const l of [...LIST_PAGES, 'category/it-kub']) {
        const h = await readB(repo, b, C.siteFile(l));
        if (h == null) continue;
        const n = C.listRename(h, l, dir, title);
        if (n !== h) b.set(C.siteFile(l), n);
      }
      await rebuildHome(repo, b, index);
    } else if (dir) {
      const sibs = C.siblingsOf(index, dir).map((p) => p.d);
      const pages = await readPages(repo, sibs);
      for (const [d, h] of pages) {
        const n = C.sideNavRename(h, d, dir, title);
        if (n !== h) b.set(C.siteFile(d), n);
      }
      const k = await readB(repo, b, C.siteFile('karta-sajta'));
      if (k != null) { const n = C.kartaRename(k, dir, title); if (n !== k) b.set(C.siteFile('karta-sajta'), n); }
    }
    b.set(C.INDEX_PATH, indexChange(index).content);
  }
  return { changes: b.list(), index };
}

async function rebuildHome(repo, b, index) {
  const home = await readB(repo, b, C.siteFile(''));
  if (home == null) return;
  const arch = await readB(repo, b, C.siteFile('archives'));
  const items = C.latestNews(index, 6, arch ? C.archiveOrder(arch) : []);
  let excerpt = '';
  if (items[0]) {
    const h = await readB(repo, b, C.siteFile(items[0].d));
    const e = h && C.getEditable(h);
    if (e) excerpt = C.excerptFrom(e.inner);
  }
  const n = C.homeNewsRebuild(home, items, excerpt);
  if (n !== home) b.set(C.siteFile(''), n);
}

// ------------------------------------------------------------------- новая страница
export async function pickTemplate(repo, index, parentDir) {
  const sibs = C.childrenOf(index, parentDir);
  const tryDirs = [...sibs.map((p) => p.d), FALLBACK_TEMPLATE];
  for (const d of tryDirs) {
    const h = await repo.read(C.siteFile(d));
    if (!h) continue;
    const e = C.getEditable(h);
    if (!e || e.kind !== 'entry') continue;
    if (/wpcf7|page-[a-z-]+\.css|akvt-rasp|<form\b/i.test(h.replace(/<script[\s\S]*?<\/script>/g, ''))) continue;
    return { dir: d, html: h, hasSiblings: sibs.some((s) => s.d === d) };
  }
  throw new Error('Не удалось подобрать шаблон страницы');
}
export function validateNewDir(index, dir) {
  if (!dir || dir.split('/').some((s) => !C.isValidSlug(s))) return 'Адрес может содержать только латинские буквы, цифры и дефисы';
  if (index.pages.some((p) => p.d === dir)) return 'Страница с таким адресом уже существует';
  return '';
}
export async function planCreatePage(repo, ctx, { parentDir, title, slug, body = C.DEFAULT_BODY }) {
  const index = structuredClone(ctx.index);
  const dir = parentDir ? `${parentDir}/${slug}` : slug;
  const err = validateNewDir(index, dir);
  if (err) throw new Error(err);
  if (parentDir && !index.pages.some((p) => p.d === parentDir)) throw new Error('Родительская страница не найдена');
  const b = new Batch();
  const id = C.newId();
  const tpl = await pickTemplate(repo, index, parentDir);
  let html = C.buildPage(tpl.html, tpl.dir, { dir, title, body, ancestors: C.ancestorsOf(index, dir), id });
  // боковое меню: у соседей добавляем новый пункт; у новой страницы — меню соседей + она сама
  const sibs = C.childrenOf(index, parentDir).map((p) => p.d);
  const sibHtml = await readPages(repo, sibs);
  for (const [d, h] of sibHtml) {
    const n = C.sideNavAdd(h, d, dir, title, id);
    if (n !== h) b.set(C.siteFile(d), n);
  }
  if (tpl.hasSiblings) html = C.sideNavAdd(html, dir, dir, title, id);
  else html = sideNavReset(html, dir, title, id);
  html = C.sideNavMarkCurrent(html, dir);
  html = C.syncChrome(html, dir, ctx.header, ctx.footer);
  b.set(C.siteFile(dir), html);
  const karta = await readB(repo, b, C.siteFile('karta-sajta'));
  if (karta != null) { const n = C.kartaAdd(karta, dir, title, parentDir, id); if (n !== karta) b.set(C.siteFile('karta-sajta'), n); }
  const sm = await repo.read('site/sitemap.xml');
  if (sm != null) b.set('site/sitemap.xml', C.sitemapAdd(sm, dir, C.todayIso()));
  C.indexUpsert(index, { d: dir, t: title });
  b.set(C.INDEX_PATH, indexChange(index).content);
  return { changes: b.list(), index, dir };
}
export function sideNavReset(html, selfDir, title, id) {
  const i = html.search(/<div\b[^>]*\bid\s*=\s*["']side-navi["'][^>]*>/i);
  if (i < 0) return html;
  const r = C.elementRange(html, i);
  const li = `<li class="page_item page-item-${id} current_page_item"><a href="${C.pageHref(selfDir, selfDir)}" aria-current="page">${C.escapeHtml(title)}</a></li>`;
  return html.slice(0, r.openEnd) + `\n\t\t<div>\n\t\t${li}\n\t\t</div>\n\t` + html.slice(r.closeStart);
}

// ------------------------------------------------------------------- новость
export async function planCreateNews(repo, ctx, { title, slug, dateIso, body, itKub = false, time }) {
  time = time || (dateIso === C.todayIso() ? new Date().toTimeString().slice(0, 8) : '12:00:00');
  const index = structuredClone(ctx.index);
  const [y, m, d] = dateIso.split('-');
  const dir = `${y}/${m}/${d}/${slug}`;
  const err = validateNewDir(index, dir);
  if (err) throw new Error(err);
  const b = new Batch();
  const tplEntry = C.latestNews(index, 50).find((p) => p.d.split('/').length === 4);
  if (!tplEntry) throw new Error('Нет шаблона новости');
  const tplHtml = await repo.read(C.siteFile(tplEntry.d));
  let html = C.buildNewsPage(tplHtml, tplEntry.d, { dir, title, dateIso, body, id: C.newId() });
  html = C.syncChrome(html, dir, ctx.header, ctx.footer);
  b.set(C.siteFile(dir), html);
  const lists = [...LIST_PAGES, ...(itKub ? ['category/it-kub'] : [])];
  for (const l of lists) {
    const h = await repo.read(C.siteFile(l));
    if (h == null) continue;
    const n = C.listAdd(h, l, dir, title, dateIso);
    if (n !== h) b.set(C.siteFile(l), n);
  }
  const sm = await repo.read('site/sitemap.xml');
  if (sm != null) b.set('site/sitemap.xml', C.sitemapAdd(sm, dir, dateIso));
  C.indexUpsert(index, { d: dir, t: title, n: 1, date: dateIso });
  await rebuildHome(repo, b, index);
  b.set(C.INDEX_PATH, indexChange(index).content);
  return { changes: b.list(), index, dir };
}

// ------------------------------------------------------------------- удаление
export async function planDeletePage(repo, ctx, dir) {
  const index = structuredClone(ctx.index);
  const entry = index.pages.find((p) => p.d === dir);
  if (!entry || !dir) throw new Error('Страница не найдена');
  if (C.hasDescendants(index, dir)) throw new Error('У страницы есть вложенные страницы. Сначала удалите или перенесите их.');
  if (['archives', 'karta-sajta', 'category/news', 'category/it-kub', 'zayavlenie'].includes(dir)) throw new Error('Эту служебную страницу удалять нельзя');
  const b = new Batch();
  b.del(C.siteFile(dir));
  if (entry.n) {
    for (const l of [...LIST_PAGES, 'category/it-kub']) {
      const h = await readB(repo, b, C.siteFile(l));
      if (h == null) continue;
      const n = C.listRemove(h, l, dir);
      if (n !== h) b.set(C.siteFile(l), n);
    }
    C.indexRemove(index, dir);
    await rebuildHome(repo, b, index);
  } else {
    const sibs = C.siblingsOf(index, dir).map((p) => p.d);
    for (const [d, h] of await readPages(repo, sibs)) {
      const n = C.sideNavRemove(h, d, dir);
      if (n !== h) b.set(C.siteFile(d), n);
    }
    const k = await readB(repo, b, C.siteFile('karta-sajta'));
    if (k != null) { const n = C.kartaRemove(k, dir); if (n !== k) b.set(C.siteFile('karta-sajta'), n); }
    C.indexRemove(index, dir);
  }
  const sm = await repo.read('site/sitemap.xml');
  if (sm != null) b.set('site/sitemap.xml', C.sitemapRemove(sm, dir));
  b.set(C.INDEX_PATH, indexChange(index).content);
  return { changes: b.list(), index };
}

// ------------------------------------------------------------------- шапка / подвал / меню
export async function planSaveChrome(repo, ctx, { header, footer }, onProgress = () => {}) {
  const b = new Batch();
  if (header !== ctx.header) b.set(C.HEADER_PARTIAL, header);
  if (footer !== ctx.footer) b.set(C.FOOTER_PARTIAL, footer);
  const dirs = ctx.index.pages.map((p) => p.d);
  let done = 0;
  const queue = [...dirs];
  const worker = async () => {
    while (queue.length) {
      const d = queue.shift();
      const h = await repo.read(C.siteFile(d));
      if (h != null) {
        const n = C.syncChrome(h, d, header, footer);
        if (n !== h) b.set(C.siteFile(d), n);
      }
      onProgress(++done, dirs.length);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return { changes: b.list() };
}

// ------------------------------------------------------------------- файлы
export const safeFileName = (name) => {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const s = C.slugify(base) || 'file';
  return ext ? `${s}.${ext}` : s;
};
export function uploadPath(name, now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `wp-content/uploads/${y}/${m}/${safeFileName(name)}`;
}
export const planUpload = (files) => ({ changes: files.map((f) => ({ path: `site/${f.rootPath}`, base64: f.base64 })) });
