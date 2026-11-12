// Architecture & Engineering: PKSic, dakroy [Б5Ч]
// AKVT admin core — чистые функции без DOM. Работают и в браузере, и в Node (тесты).
// Все правки HTML — точечные текстовые замены, остальной файл не трогается.

export const BRAND = ' | АКВТ';
export const INDEX_PATH = 'admin/pages-index.json';
export const HEADER_PARTIAL = 'site/partials/header.html';
export const FOOTER_PARTIAL = 'site/partials/footer.html';

// ---------------------------------------------------------------- пути
export const siteFile = (dir) => (dir ? `site/${dir}/index.html` : 'site/index.html');
export const depthOf = (dir) => (dir ? dir.split('/').length : 0);
export const up = (d) => '../'.repeat(d);
export const parentOf = (dir) => (dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '');
export const slugOf = (dir) => dir.slice(dir.lastIndexOf('/') + 1);
export const urlOfDir = (dir) => (dir ? `/${dir}/` : '/');

/** относительная ссылка со страницы dir на файл rootPath (путь от корня сайта без «/») */
export function relFromDir(dir, rootPath) {
  return up(depthOf(dir)) + rootPath;
}
export const pageHref = (fromDir, toDir) => relFromDir(fromDir, toDir ? `${toDir}/index.html` : 'index.html');

/** относительный url (как в HTML страницы fromDir) -> путь от корня сайта */
export function resolveToRoot(fromDir, url) {
  const m = /^([^?#]*)(.*)$/.exec(url);
  const parts = fromDir ? fromDir.split('/') : [];
  for (const seg of m[1].split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  let p = parts.join('/');
  if (m[1].endsWith('/') && p) p += '/';
  return p + m[2];
}
const isRelative = (u) => u !== '' && !/^([a-z][a-z0-9+.-]*:|\/|#|\?|\{\{)/i.test(u);

// ---------------------------------------------------------------- html-утилиты
export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');
export function unescapeHtml(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&');
}
export const stripTags = (s) => unescapeHtml(String(s).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const RU = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shh', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
export function slugify(s) {
  const t = String(s).toLowerCase().split('').map((c) => (c in RU ? RU[c] : c)).join('');
  return t.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
export const isValidSlug = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

/** Диапазон элемента, открывающий тег которого начинается в openIdx. Учитывает вложенность одноимённых тегов. */
export function elementRange(html, openIdx) {
  const tm = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(html.slice(openIdx, openIdx + 40));
  if (!tm) return null;
  const tag = tm[1].toLowerCase();
  const re = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/gi;
  re.lastIndex = openIdx;
  let depth = 0;
  let openEnd = -1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<!--') || m[1]) continue;
    if (m[3].toLowerCase() !== tag) continue;
    if (m[2] === '/') {
      depth--;
      if (depth === 0) return { start: openIdx, openEnd, closeStart: m.index, end: m.index + m[0].length };
    } else if (!m[4]) {
      depth++;
      if (depth === 1) openEnd = m.index + m[0].length;
    } else if (depth === 0) {
      return { start: openIdx, openEnd: m.index + m[0].length, closeStart: m.index + m[0].length, end: m.index + m[0].length };
    }
  }
  return null;
}

function findOpenTag(html, re, from = 0) {
  const r = new RegExp(re.source, re.flags.replace('g', ''));
  const m = r.exec(html.slice(from));
  return m ? from + m.index : -1;
}
const classTagRe = (cls) => new RegExp(`<[a-zA-Z][a-zA-Z0-9]*\\b[^>]*\\bclass\\s*=\\s*["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>`, 'i');
const idTagRe = (id) => new RegExp(`<[a-zA-Z][a-zA-Z0-9]*\\b[^>]*\\bid\\s*=\\s*["']${id}["'][^>]*>`, 'i');

// ---------------------------------------------------------------- пересчёт относительных ссылок
/** переписывает относительные ссылки html, написанного для страницы fromDir, под страницу toDir */
export function rebase(html, fromDir, toDir) {
  if (fromDir === toDir) return html;
  const fix = (u) => (isRelative(u) ? relFromDir(toDir, resolveToRoot(fromDir, u)) : u);
  let out = html.replace(/(\s(?:href|src|action|poster|data-src|data-href)\s*=\s*)(["'])([^"']*)\2/gi, (_, a, q, u) => a + q + fix(u) + q);
  out = out.replace(/(\ssrcset\s*=\s*)(["'])([^"']*)\2/gi, (_, a, q, v) =>
    a + q + v.split(',').map((part) => { const t = part.trim().split(/\s+/); t[0] = fix(t[0]); return t.join(' '); }).join(', ') + q);
  out = out.replace(/url\((['"]?)([^)'"]+)\1\)/g, (_, q, u) => `url(${q}${fix(u)}${q})`);
  return out;
}
/** корневые ссылки partial-файла (/a/b/index.html) -> относительные для страницы dir */
export function relativizeRootLinks(html, dir) {
  const d = up(depthOf(dir));
  return html.replace(/(\s(?:href|src|action)\s*=\s*)(["'])\/(?!\/)([^"']*)\2/gi, (_, a, q, p) => a + q + d + (p === '' ? 'index.html' : p) + q);
}

// ---------------------------------------------------------------- шапка/подвал
const markerRe = (name) => new RegExp(`(<!--akvt-${name}:start-->)([\\s\\S]*?)(<!--akvt-${name}:end-->)`);
/** подставляет актуальные partials в страницу (внутри маркеров), сохраняя пробелы по краям */
export function syncChrome(html, dir, header, footer) {
  let out = html;
  for (const [name, partial] of [['header', header], ['footer', footer]]) {
    if (partial == null) continue;
    const re = markerRe(name);
    const m = re.exec(out);
    if (!m) continue;
    const inner = m[2];
    const lead = /^\s*/.exec(inner)[0];
    const trail = /\s*$/.exec(inner)[0];
    const fresh = relativizeRootLinks(partial, dir).trim();
    if (inner.trim() === fresh) continue;
    out = out.slice(0, m.index) + m[1] + lead + fresh + trail + m[3] + out.slice(m.index + m[0].length);
  }
  return out;
}

// ---------------------------------------------------------------- редактируемая область
/** Область контента: .entry-content → <main id="main-content"> → null (страница-список) */
export function getEditable(html) {
  let idx = findOpenTag(html, classTagRe('entry-content'));
  let kind = 'entry';
  if (idx < 0) {
    idx = findOpenTag(html, /<main\b[^>]*id\s*=\s*["']main-content["'][^>]*>/i);
    kind = 'main';
  }
  if (idx < 0) return null;
  const r = elementRange(html, idx);
  if (!r) return null;
  return { kind, ...r, inner: html.slice(r.openEnd, r.closeStart) };
}
export function setEditable(html, newInner) {
  const e = getEditable(html);
  if (!e) throw new Error('В этой странице нет редактируемой области');
  return html.slice(0, e.openEnd) + newInner + html.slice(e.closeStart);
}

// ---------------------------------------------------------------- заголовок / описание
export function getTitle(html) {
  const m = /<title>([\s\S]*?)<\/title>/i.exec(html);
  let t = m ? unescapeHtml(m[1]).trim() : '';
  if (t.endsWith(BRAND)) t = t.slice(0, -BRAND.length);
  return t;
}
export function getH1(html) {
  const m = /<h1[^>]*class\s*=\s*["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  return m ? stripTags(m[1]) : '';
}
export function getDescription(html) {
  const m = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  return m ? unescapeHtml(m[1]) : '';
}
export function setDescription(html, desc) {
  const re = /(<meta\s+name=["']description["']\s+content=)(["'])([^"']*)\2/i;
  if (re.test(html)) return html.replace(re, (_, a, q) => a + '"' + escapeAttr(desc) + '"');
  return html.replace(/<\/title>/i, `</title>\n<meta name="description" content="${escapeAttr(desc)}">`);
}
/** меняет <title>, h1.entry-title и «текущий» пункт хлебных крошек */
export function setTitle(html, title, oldTitle, brand = BRAND) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}${brand}</title>`);
  out = out.replace(/(<h1[^>]*class\s*=\s*["'][^"']*entry-title[^"']*["'][^>]*>)([\s\S]*?)(<\/h1>)/i, (_, a, _b, c) => a + escapeHtml(title) + c);
  out = out.replace(/(class="[^"]*current-item[^"]*">)([^<]*)(<\/a>)/, (_, a, _b, c) => a + escapeHtml(title) + c);
  if (oldTitle) {
    out = out.replace(new RegExp(`(<a[^>]*current-item[^>]*title=")[^"]*(")`), `$1Перейти к ${escapeAttr(title)}.$2`);
  }
  return out;
}

// ---------------------------------------------------------------- боковое меню раздела (side-navi)
function sideNavRange(html) {
  const i = findOpenTag(html, idTagRe('side-navi'));
  if (i < 0) return null;
  return elementRange(html, i);
}
const liForRe = (selfDir, targetDir) => {
  const href = pageHref(selfDir, targetDir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<li\\b[^>]*>\\s*<a\\b[^>]*href="${href}"[^>]*>[\\s\\S]*?</a>\\s*</li>\\s*`, 'i');
};
export function sideNavAdd(html, selfDir, newDir, title, pageId) {
  const r = sideNavRange(html);
  if (!r) return html;
  const seg = html.slice(r.start, r.end);
  if (liForRe(selfDir, newDir).test(seg)) return html;
  const li = `<li class="page_item page-item-${pageId}"><a href="${pageHref(selfDir, newDir)}">${escapeHtml(title)}</a></li>`;
  const lastLi = seg.lastIndexOf('</li>');
  if (lastLi < 0) return html;
  const at = lastLi + 5;
  const ws = /^\s*/.exec(seg.slice(at))[0];
  return html.slice(0, r.start) + seg.slice(0, at) + ws + li + seg.slice(at) + html.slice(r.end);
}
export function sideNavRemove(html, selfDir, targetDir) {
  const r = sideNavRange(html);
  if (!r) return html;
  const seg = html.slice(r.start, r.end);
  const re = liForRe(selfDir, targetDir);
  if (!re.test(seg)) return html;
  return html.slice(0, r.start) + seg.replace(re, '') + html.slice(r.end);
}
export function sideNavRename(html, selfDir, targetDir, title) {
  const r = sideNavRange(html);
  if (!r) return html;
  const seg = html.slice(r.start, r.end);
  const href = pageHref(selfDir, targetDir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<a\\b[^>]*href="${href}"[^>]*>)([\\s\\S]*?)(</a>)`, 'i');
  if (!re.test(seg)) return html;
  return html.slice(0, r.start) + seg.replace(re, (_, a, _b, c) => a + escapeHtml(title) + c) + html.slice(r.end);
}
/** отметить страницу selfDir как текущую в её собственном меню */
export function sideNavMarkCurrent(html, selfDir) {
  const r = sideNavRange(html);
  if (!r) return html;
  let seg = html.slice(r.start, r.end).replace(/\s*current_page_item/g, '').replace(/\s+aria-current="page"/g, '');
  const href = pageHref(selfDir, selfDir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  seg = seg.replace(new RegExp(`<li class="(page_item[^"]*)"><a href="${href}"`), (_, c) => `<li class="${c} current_page_item"><a href="${pageHref(selfDir, selfDir)}" aria-current="page"`);
  return html.slice(0, r.start) + seg + html.slice(r.end);
}

// ---------------------------------------------------------------- хлебные крошки
export function setBreadcrumb(html, dir, ancestors, title, { kind = 'page' } = {}) {
  const i = findOpenTag(html, classTagRe('breadcrumb'));
  if (i < 0) return html;
  const r = elementRange(html, i);
  if (!r) return html;
  const home = `<span><a title="Перейти к АКВТ." href="${relFromDir(dir, 'index.html')}" class="home">АКВТ</a></span>`;
  const mid = ancestors.map((a) => `<span><a title="Перейти к ${escapeAttr(a.t)}." href="${pageHref(dir, a.d)}" class="${a.cls || 'post post-page'}">${escapeHtml(a.t)}</a></span>`).join('');
  const cur = `<span><a title="Перейти к ${escapeAttr(title)}." href="${pageHref(dir, dir)}" class="${kind === 'news' ? 'post post-post' : 'post post-page'} current-item">${escapeHtml(title)}</a></span>`;
  return html.slice(0, r.openEnd) + '\n<!-- Breadcrumb NavXT 7.3.0 -->\n' + home + mid + cur + html.slice(r.closeStart);
}

// ---------------------------------------------------------------- идентификаторы
export const newId = () => 100000 + Math.floor(Math.random() * 800000);
function setPostId(html, id) {
  return html
    .replace(/(<article\b[^>]*\bid=")post-\d+(")/i, `$1post-${id}$2`)
    .replace(/(<article\b[^>]*\bclass="[^"]*)\bpost-\d+/i, `$1post-${id}`);
}

// ---------------------------------------------------------------- индекс страниц
export function titleToIndexEntry(dir, html) {
  const e = { d: dir, t: getTitle(html) || getH1(html) || dir || 'Главная' };
  const m = /^(\d{4})\/(\d{2})\/(?:(\d{2})\/)?[^/]+$/.exec(dir);
  if (m) {
    e.n = 1; e.date = `${m[1]}-${m[2]}-${m[3] || '01'}`;
  }
  return e;
}
export function indexSort(pages) {
  return pages.sort((a, b) => a.d.localeCompare(b.d));
}
export function indexUpsert(index, entry) {
  const i = index.pages.findIndex((p) => p.d === entry.d);
  if (i >= 0) index.pages[i] = { ...index.pages[i], ...entry };
  else index.pages.push(entry);
  indexSort(index.pages);
  return index;
}
export function indexRemove(index, dir) {
  index.pages = index.pages.filter((p) => p.d !== dir);
  return index;
}
export const childrenOf = (index, dir) => index.pages.filter((p) => p.d !== dir && parentOf(p.d) === dir && !p.n && p.d !== '');
export const siblingsOf = (index, dir) => index.pages.filter((p) => p.d !== dir && parentOf(p.d) === parentOf(dir) && !p.n && p.d !== '');
export function ancestorsOf(index, dir) {
  const out = [];
  let d = parentOf(dir);
  while (d) {
    const p = index.pages.find((x) => x.d === d);
    if (p) out.unshift({ d: p.d, t: p.t });
    d = parentOf(d);
  }
  return out;
}
export const hasDescendants = (index, dir) => index.pages.some((p) => p.d.startsWith(dir + '/'));

// ---------------------------------------------------------------- карта сайта (karta-sajta) и sitemap.xml
export function kartaAdd(html, dir, title, parent, pageId) {
  const kdir = 'karta-sajta';
  const li = () => `<li class="page_item page-item-${pageId}"><a href="${pageHref(kdir, dir)}">${escapeHtml(title)}</a></li>`;
  const ulStart = findOpenTag(html, /<ul\b[^>]*class\s*=\s*["'][^"']*sitemap-pages[^"']*["'][^>]*>/i);
  if (ulStart < 0) return html;
  const ul = elementRange(html, ulStart);
  if (!parent) return html.slice(0, ul.closeStart) + li() + '\n' + html.slice(ul.closeStart);
  const href = pageHref(kdir, parent).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const am = new RegExp(`<a\\b[^>]*href="${href}"[^>]*>`).exec(html.slice(ul.start, ul.end));
  if (!am) return html.slice(0, ul.closeStart) + li() + '\n' + html.slice(ul.closeStart);
  const liStart = html.lastIndexOf('<li', ul.start + am.index);
  const lr = elementRange(html, liStart);
  if (!lr) return html;
  const liHtml = html.slice(lr.start, lr.end);
  const cm = /<ul\s+class=['"]children['"]>/.exec(liHtml);
  if (cm) {
    const cStart = lr.start + cm.index;
    const cr = elementRange(html, cStart);
    return html.slice(0, cr.closeStart) + li() + '\n' + html.slice(cr.closeStart);
  }
  const nl = liHtml.replace(/<li class="page_item page-item-(\d+)">/, '<li class="page_item page-item-$1 page_item_has_children">')
    .replace(/<\/li>\s*$/, ` <ul class='children'>\n${li()}\n</ul>\n</li>`);
  return html.slice(0, lr.start) + nl + html.slice(lr.end);
}
export function kartaRemove(html, dir) {
  const href = pageHref('karta-sajta', dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`<li class="page_item page-item-\\d+"><a href="${href}">[^<]*</a></li>\\s*`), '');
}
export function kartaRename(html, dir, title) {
  const href = pageHref('karta-sajta', dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(<a href="${href}">)[^<]*(</a>)`), `$1${escapeHtml(title)}$2`);
}
export function sitemapAdd(xml, dir, dateIso) {
  const loc = `https://www.akvt.ru/${dir}/`;
  if (xml.includes(`<loc>${loc}</loc>`)) return xml;
  return xml.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${dateIso}</lastmod>\n  </url>\n</urlset>`);
}
export function sitemapRemove(xml, dir) {
  const loc = `https://www.akvt.ru/${dir}/`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return xml.replace(new RegExp(`\\s*<url>\\s*<loc>${loc}</loc>[\\s\\S]*?</url>`), '');
}

// ---------------------------------------------------------------- списки новостей (archives, category/*)
const newsHrefDate = (href) => {
  const m = /(\d{4})\/(\d{2})\/(?:(\d{2})\/)?[^/]+\/index\.html/.exec(href);
  return m ? `${m[1]}-${m[2]}-${m[3] || '00'}` : '0000-00-00';
};
export function listAdd(html, listDir, dir, title, dateIso) {
  const href = pageHref(listDir, dir);
  if (html.includes(`href="${href}"`)) return html;
  const li = `<li class="item_archive"><a href="${href}" title="${escapeAttr(title)}">${escapeHtml(title)}</a></li>`;
  const ol = findOpenTag(html, /<ol\b[^>]*>/i);
  if (ol < 0) return html;
  const r = elementRange(html, ol);
  const body = html.slice(r.openEnd, r.closeStart);
  const re = /<li class="item_archive"><a href="([^"]*)"/g;
  let m;
  while ((m = re.exec(body))) {
    if (newsHrefDate(m[1]) <= dateIso) {
      const at = r.openEnd + m.index;
      return html.slice(0, at) + li + ' ' + html.slice(at);
    }
  }
  return html.slice(0, r.closeStart) + ' ' + li + ' ' + html.slice(r.closeStart);
}
export function listRemove(html, listDir, dir) {
  const href = pageHref(listDir, dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`\\s*<li class="item_archive"><a href="${href}"[^>]*>[\\s\\S]*?</a></li>`), '');
}
export function listRename(html, listDir, dir, title) {
  const href = pageHref(listDir, dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(<li class="item_archive"><a href="${href}" title=")[^"]*(">)[^<]*(</a></li>)`), `$1${escapeAttr(title)}$2${escapeHtml(title)}$3`);
}

// ---------------------------------------------------------------- главная: блок новостей
const ACCENTS = ['periwinkle', 'green', 'coral', 'gold', 'sky', 'periwinkle'];
const DELAYS = ['', ' data-delay="1"', ' data-delay="2"', ' data-delay="1"', ' data-delay="1"', ' data-delay="2"'];
const ruDate = (iso) => iso.split('-').reverse().join('.');
export function homeNewsCards(items, excerpt) {
  return items.slice(0, 6).map((n, i) => {
    const href = `${n.d}/index.html`;
    const ex = i === 0 && excerpt ? `\n          <p class="nc-excerpt">${escapeHtml(excerpt)}</p>` : '';
    return `      <article class="news-card${i === 0 ? ' featured' : ''}" data-reveal${DELAYS[i]}>
        <span class="nc-accent ${ACCENTS[i]}"></span>
        <div class="nc-body">
          <span class="nc-date">${ruDate(n.date)}</span>
          <h3><a href="${href}">${escapeHtml(n.t)}</a></h3>${ex}
          <div class="nc-foot"><a href="${href}">Читать далее</a> <span class="arr">→</span></div>
        </div>
      </article>`;
  }).join('\n\n');
}
export function homeNewsRebuild(html, items, excerpt) {
  const i = findOpenTag(html, classTagRe('news-grid'));
  if (i < 0) return html;
  const r = elementRange(html, i);
  return html.slice(0, r.openEnd) + '\n' + homeNewsCards(items, excerpt) + '\n    ' + html.slice(r.closeStart);
}
export function excerptFrom(bodyHtml, max = 200) {
  const t = stripTags(bodyHtml);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 60)).replace(/[\s,.;:–-]+$/, '') + '…';
}
/** новые сверху: по дате из адреса, при равных датах — в порядке списка archives (order = массив dir) */
export function latestNews(index, n = 6, order = []) {
  const pos = (d) => { const i = order.indexOf(d); return i < 0 ? 1e9 : i; };
  return index.pages.filter((p) => p.n)
    .sort((a, b) => b.date.localeCompare(a.date) || pos(a.d) - pos(b.d) || a.d.localeCompare(b.d)).slice(0, n);
}
export function archiveOrder(archivesHtml) {
  const out = [];
  for (const m of archivesHtml.matchAll(/<li class="item_archive"><a href="((?:\.\.\/)+)([^"]*?)\/index\.html"/g)) out.push(m[2]);
  return out;
}

// ---------------------------------------------------------------- страница новости

// ---------------------------------------------------------------- рубрики и теги
export const STANDARD_CATEGORIES = [
  { slug: 'news', title: 'Новости АКВТ', dir: 'category/news', isDefault: true },
  { slug: 'it-kub', title: 'IT-Куб', dir: 'category/it-kub' },
  { slug: 'studentam', title: 'Студентам', dir: 'category/studentam' },
  { slug: 'abiturientam', title: 'Абитуриентам', dir: 'category/abiturientam' },
  { slug: 'meropriyatiya', title: 'Мероприятия', dir: 'category/meropriyatiya' },
  { slug: 'obyavleniya', title: 'Объявления', dir: 'category/obyavleniya' },
  { slug: 'sport', title: 'Спорт', dir: 'category/sport' },
  { slug: 'dostizheniya', title: 'Достижения', dir: 'category/dostizheniya' },
];

export function categoryTitle(slug) {
  const c = STANDARD_CATEGORIES.find((x) => x.slug === slug);
  if (c) return c.title;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function buildCategoryArchive(templateHtml, catDir, catTitle) {
  let html = rebase(templateHtml, 'category/news', catDir);
  html = setTitle(html, `${catTitle} | АКВТ`);
  html = html.replace(/<h1 class="entry-title">[^<]*<\/h1>/i, `<h1 class="entry-title">${escapeHtml(catTitle)}</h1>`);
  html = html.replace(/<ol\b[^>]*>[\s\S]*?<\/ol>/i, '<ol></ol>');
  return html;
}

export function buildNewsPage(template, templateDir, { dir, title, dateIso, time = '12:00:00', body, id, categories = ['news'], tags = [] }) {
  let html = rebase(template, templateDir, dir);
  html = setTitle(html, title);

  const cats = Array.isArray(categories) && categories.length ? categories : ['news'];
  const primaryCatSlug = cats.includes('news') ? 'news' : cats[0];
  const primaryTitle = primaryCatSlug === 'news' ? 'Новости' : categoryTitle(primaryCatSlug);
  html = setBreadcrumb(html, dir, [{ d: `category/${primaryCatSlug}`, t: primaryTitle, cls: 'taxonomy category' }], title, { kind: 'news' });

  html = html.replace(/(<time class="entry-date" datetime=")[^"]*(">)[^<]*(<\/time>)/, `$1${dateIso}T${time}+03:00$2${ruDate(dateIso)}$3`);
  html = html.replace(/(<span class="nav-previous">)[\s\S]*?(<\/span>\s*<span class="nav-next">)[\s\S]*?(<\/span>\s*<\/nav>)/, '$1$2$3');

  const catLinks = cats.map((slug) => {
    const cDir = `category/${slug}`;
    const cTitle = categoryTitle(slug);
    const href = pageHref(dir, cDir);
    const cls = slug === 'it-kub' ? 'news-tag-item itkub' : 'news-tag-item';
    return `<a href="${href}" class="${cls}" rel="category tag">${escapeHtml(cTitle)}</a>`;
  });
  const tagSpans = (Array.isArray(tags) ? tags : []).filter(Boolean).map((t) => `<span class="news-tag-item custom">#${escapeHtml(t.trim())}</span>`);
  const allBadges = [...catLinks, ...tagSpans].join(' ');
  const tagsBar = allBadges ? `<div class="news-tags-bar">${allBadges}</div>` : '';

  const contentWithTags = tagsBar ? `${tagsBar}\n\t\t${body}` : body;
  html = setEditable(html, `\n\t\t${contentWithTags}\n\t\t`);

  const metaHtml = `<footer class="entry-meta">\n\t\t<span class="cat-links"><span class="entry-utility-prep entry-utility-prep-cat-links">Рубрики:</span> ${catLinks.join(', ')}</span>\n\t\t${tagSpans.length ? `<span class="tag-links"><span class="entry-utility-prep entry-utility-prep-tag-links">Теги:</span> ${tagSpans.join(', ')}</span>` : ''}\n\t</footer>`;
  html = html.replace(/<footer class=["']entry-meta["']>[\s\S]*?<\/footer>/i, metaHtml);

  html = setPostId(html, id);
  return html;
}

// ---------------------------------------------------------------- обычная страница
export function buildPage(template, templateDir, { dir, title, body, ancestors, id }) {
  let html = rebase(template, templateDir, dir);
  html = setTitle(html, title);
  html = setBreadcrumb(html, dir, ancestors, title);
  html = setEditable(html, `\n\t\t${body}\n\t`);
  html = setPostId(html, id);
  return html;
}
export const DEFAULT_BODY = '<p>Текст страницы. Откройте её в админке и замените этот текст.</p>';

// ---------------------------------------------------------------- меню
const attrRe = /href="([^"]*)"/;
function anchorsOf(block) {
  const out = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(block))) {
    const h = attrRe.exec(m[1]);
    out.push({ attrs: m[1], href: h ? h[1] : '', label: stripTags(m[2].replace(/<span class="(?:caret|arr)">[^<]*<\/span>/g, '')), raw: m[0] });
  }
  return out;
}
export function parseMenus(header) {
  const dm = /<nav class="hp-menu"[^>]*>([\s\S]*?)<\/nav>/.exec(header);
  const mm = /<nav class="hp-mobile-nav"[^>]*>([\s\S]*?)<\/nav>/.exec(header);
  const desktop = [];
  if (dm) {
    const body = dm[1];
    const re = /<div class="has-drop">([\s\S]*?<\/div>\s*<\/div>)\s*<\/div>|<a\b[^>]*>[\s\S]*?<\/a>/g;
    let m;
    while ((m = re.exec(body))) {
      if (m[1]) {
        const foot = /<div class="mega-foot">([\s\S]*?)<\/div>/.exec(m[1]);
        const footA = foot ? anchorsOf(foot[1])[0] : null;
        const rest = anchorsOf(m[1].replace(/<div class="mega-foot">[\s\S]*?<\/div>/, ''));
        const head = rest[0];
        desktop.push({ label: head.label, href: head.href, children: rest.slice(1).map((a) => ({ label: a.label, href: a.href })), foot: footA ? { label: footA.label, href: footA.href } : null });
      } else {
        const a = anchorsOf(m[0])[0];
        desktop.push({ label: a.label, href: a.href, children: [] });
      }
    }
  }
  const mobile = [];
  if (mm) {
    const body = mm[1];
    const re = /<a class="m-parent"[^>]*>[\s\S]*?<\/a>\s*<div class="m-sub">[\s\S]*?<\/div>|<a\b[^>]*>[\s\S]*?<\/a>/g;
    let m;
    while ((m = re.exec(body))) {
      const as = anchorsOf(m[0]);
      if (m[0].startsWith('<a class="m-parent"')) {
        mobile.push({ label: as[0].label, href: as[0].href, children: as.slice(1).map((a) => ({ label: a.label, href: a.href })) });
      } else if (/pwa-m-install|javascript:/.test(m[0])) {
        mobile.push({ raw: m[0] });
      } else {
        mobile.push({ label: as[0].label, href: as[0].href, children: [] });
      }
    }
  }
  return { desktop, mobile };
}
const a2 = (href, label, extra = '') => `<a${extra} href="${escapeAttr(href)}">${escapeHtml(label)}</a>`;
export function renderDesktopMenu(items) {
  return '\n' + items.map((it) => {
    if (!it.children || !it.children.length) return `      ${a2(it.href, it.label)}`;
    const kids = it.children.map((c) => `          ${a2(c.href, c.label)}`).join('\n');
    const foot = it.foot ? `\n          <div class="mega-foot">\n            <a class="link-arrow" href="${escapeAttr(it.foot.href)}">${escapeHtml(it.foot.label)} <span class="arr">→</span></a>\n          </div>` : '';
    return `      <div class="has-drop">\n        <a href="${escapeAttr(it.href)}">${escapeHtml(it.label)} <span class="caret">▾</span></a>\n        <div class="mega-panel">\n${kids}${foot}\n        </div>\n      </div>\n`;
  }).join('\n') + '\n    ';
}
export function renderMobileMenu(items) {
  return '\n' + items.map((it) => {
    if (it.raw) return `  ${it.raw}`;
    if (!it.children || !it.children.length) return `  ${a2(it.href, it.label)}`;
    const kids = it.children.map((c) => `    ${a2(c.href, c.label)}`).join('\n');
    return `  <a class="m-parent" href="${escapeAttr(it.href)}">${escapeHtml(it.label)} <span class="caret">▾</span></a>\n  <div class="m-sub">\n${kids}\n  </div>`;
  }).join('\n') + '\n';
}
export function applyMenus(header, { desktop, mobile }) {
  let out = header;
  if (desktop) out = out.replace(/(<nav class="hp-menu"[^>]*>)[\s\S]*?(<\/nav>)/, (_, a, b) => a + renderDesktopMenu(desktop) + b);
  if (mobile) out = out.replace(/(<nav class="hp-mobile-nav"[^>]*>)[\s\S]*?(<\/nav>)/, (_, a, b) => a + renderMobileMenu(mobile) + b);
  return out;
}

// ---------------------------------------------------------------- контакты (шапка + подвал)
export function parseContacts(header, footer) {
  const both = header + '\n' + footer;
  const phones = [];
  const pre = /<a href="tel:([^"]+)">([^<]+)<\/a>/g;
  let m;
  const seen = new Set();
  while ((m = pre.exec(header))) { if (!seen.has(m[1])) { seen.add(m[1]); phones.push({ tel: m[1], label: m[2] }); } }
  const ticker = /<div class="ticker">\s*<span>([^<]*)<\/span>/.exec(header);
  const addr = /<span>(г\.[^<]*)<\/span>/.exec(header);
  const email = /href="mailto:([^"]+)"/.exec(footer);
  const social = (cls) => { const r = new RegExp(`<a href="([^"]*)"[^>]*class="${cls}"`).exec(footer); return r ? r[1] : ''; };
  const copy = /<p class="footer-copy">([\s\S]*?)<\/p>/.exec(footer);
  return {
    ticker: ticker ? unescapeHtml(ticker[1]) : '',
    address: addr ? unescapeHtml(addr[1]) : '',
    phones,
    email: email ? email[1] : '',
    vk: social('rollover2'), ok: social('rollover3'), tg: social('rollover6'),
    copy: copy ? copy[1] : '',
    _both: both.length,
  };
}
export function applyContacts(header, footer, oldC, newC) {
  let h = header; let f = footer;
  const rep = (a, b) => { if (a && a !== b) { h = h.split(a).join(b); f = f.split(a).join(b); } };
  rep(escapeHtml(oldC.ticker), escapeHtml(newC.ticker));
  rep(escapeHtml(oldC.address), escapeHtml(newC.address));
  oldC.phones.forEach((p, i) => {
    const n = newC.phones[i];
    if (!n) return;
    rep(`<a href="tel:${p.tel}">${p.label}</a>`, `<a href="tel:${escapeAttr(n.tel)}">${escapeHtml(n.label)}</a>`);
  });
  rep(`mailto:${oldC.email}">${oldC.email}`, `mailto:${escapeAttr(newC.email)}">${escapeHtml(newC.email)}`);
  rep(`href="${oldC.vk}"`, `href="${escapeAttr(newC.vk)}"`);
  rep(`href="${oldC.ok}"`, `href="${escapeAttr(newC.ok)}"`);
  rep(`href="${oldC.tg}"`, `href="${escapeAttr(newC.tg)}"`);
  if (newC.copy !== oldC.copy) f = f.replace(/(<p class="footer-copy">)[\s\S]*?(<\/p>)/, `$1${newC.copy}$2`);
  return { header: h, footer: f };
}

export const todayIso = () => new Date().toISOString().slice(0, 10);
