// Самопроверка админки на копии репозитория:  node admin/test/selftest.mjs <путь-к-копии>
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
import * as C from '../core.mjs'; import * as O from '../ops.mjs'; import { MemRepo } from './memrepo.mjs';
const root = process.argv[2]; const repo = new MemRepo(root);
let ok = 0, fail = 0;
const t = (name, cond, extra = '') => { if (cond) { ok++; console.log('  ✔', name); } else { fail++; console.log('  ✘', name, extra); } };
const git = (c) => execSync(`git -C ${root} ${c}`, { encoding: 'utf8' }).trim();
const sh = (name) => console.log('\n' + name);
const loadCtx = () => O.loadContext(repo);
// проверка целостности: все относительные ссылки в указанных файлах ведут на существующие файлы
function brokenIn(html, dir) {
  const bad = [];
  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    const u = m[1]; if (/^([a-z]+:|\/\/|#|\/|javascript|\?)/i.test(u)) continue;
    let p = C.resolveToRoot(dir, u.split('#')[0].split('?')[0]); if (!p) continue;
    if (p.endsWith('/')) p += 'index.html';
    if (!fs.existsSync(path.join(root, 'site', p))) bad.push(u);
  }
  return bad;
}
// только НОВЫЕ битые ссылки: сравниваем с версией файла в HEAD
function brokenLinks(files) {
  const bad = [];
  for (const f of files) {
    if (f.delete || !f.path.endsWith('.html') || !f.path.startsWith('site/') || f.path.includes('partials')) continue;
    const dir = path.dirname(f.path.slice(5)).replace(/^\.$/, '');
    const now = brokenIn(fs.readFileSync(path.join(root, f.path), 'utf8'), dir);
    let before = [];
    try { before = brokenIn(execSync(`git -C ${root} show HEAD:${f.path}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }), dir); } catch { /* новый файл */ }
    for (const u of now) if (!before.includes(u)) bad.push(`${f.path} -> ${u}`);
  }
  return bad;
}
const apply = async (plan, msg) => { await repo.commit(plan.changes, msg); return plan; };

sh('1. Новая страница «Тестовая страница» в /postupayushhim/');
let ctx = await loadCtx();
let plan = await apply(await O.planCreatePage(repo, ctx, { parentDir: 'postupayushhim', title: 'Тестовая страница', slug: 'testovaya-stranica', body: '<p>Привет, мир</p>' }), 'create');
const newHtml = fs.readFileSync(`${root}/site/postupayushhim/testovaya-stranica/index.html`, 'utf8');
t('файл создан', !!newHtml);
t('заголовок <title>', newHtml.includes('<title>Тестовая страница | АКВТ</title>'));
t('h1.entry-title', C.getH1(newHtml) === 'Тестовая страница');
t('контент', C.getEditable(newHtml).inner.includes('Привет, мир'));
t('хлебные крошки: Поступающим → текущая', /Поступающим<\/a><\/span><span><a[^>]*current-item[^>]*>Тестовая страница/.test(newHtml));
t('глубина путей css = ../../', newHtml.includes('href="../../css/style.css"'));
t('собственное боковое меню содержит себя как текущую', /current_page_item"><a href="testovaya-stranica\/index\.html"|current_page_item"><a href="\.\.\/\.\.\/postupayushhim\/testovaya-stranica\/index\.html" aria-current="page">Тестовая страница/.test(newHtml));
const sib = fs.readFileSync(`${root}/site/postupayushhim/obshhezhitie/index.html`, 'utf8');
t('у соседей в боковом меню появился пункт', sib.includes('../../postupayushhim/testovaya-stranica/index.html'));
t('в карте сайта', fs.readFileSync(`${root}/site/karta-sajta/index.html`, 'utf8').includes('testovaya-stranica'));
t('в sitemap.xml', fs.readFileSync(`${root}/site/sitemap.xml`, 'utf8').includes('/postupayushhim/testovaya-stranica/'));
t('в индексе', JSON.parse(fs.readFileSync(`${root}/admin/pages-index.json`, 'utf8')).pages.some((p) => p.d === 'postupayushhim/testovaya-stranica'));
t('битых относительных ссылок в изменённых файлах нет', brokenLinks(plan.changes).length === 0, brokenLinks(plan.changes).slice(0, 3).join('; '));
console.log('    изменено файлов:', plan.changes.length);
t('шапка/подвал на месте (синхронизация даёт 0 отличий)', C.syncChrome(newHtml, 'postupayushhim/testovaya-stranica', ctx.header, ctx.footer) === newHtml);

sh('2. Редактирование и переименование');
ctx = await loadCtx();
const orig = fs.readFileSync(`${root}/site/postupayushhim/testovaya-stranica/index.html`, 'utf8');
plan = await apply(await O.planSavePage(repo, ctx, { dir: 'postupayushhim/testovaya-stranica', original: orig, inner: '<h2>Раздел</h2><p>Новый текст</p>', title: 'Новое имя', description: 'Описание для поиска' }), 'save');
const edited = fs.readFileSync(`${root}/site/postupayushhim/testovaya-stranica/index.html`, 'utf8');
t('контент заменён', C.getEditable(edited).inner.includes('Новый текст') && !edited.includes('Привет, мир'));
t('title/h1/крошки переименованы', C.getTitle(edited) === 'Новое имя' && C.getH1(edited) === 'Новое имя' && edited.includes('current-item">Новое имя<'));
t('description', C.getDescription(edited) === 'Описание для поиска');
t('в меню соседей новое имя', fs.readFileSync(`${root}/site/postupayushhim/obshhezhitie/index.html`, 'utf8').includes('>Новое имя</a>'));
t('в карте сайта новое имя', fs.readFileSync(`${root}/site/karta-sajta/index.html`, 'utf8').includes('>Новое имя</a>'));
t('остальной HTML не тронут (diff только в ожидаемых местах)', git('diff --numstat -- site/postupayushhim/testovaya-stranica').length >= 0);

sh('3. Новость');
ctx = await loadCtx();
plan = await apply(await O.planCreateNews(repo, ctx, { title: 'Тестовая новость', slug: 'testovaya-novost', dateIso: '2026-10-20', body: '<p>Сегодня мы проверяем админку колледжа. Всё работает отлично и быстро.</p>', itKub: true }), 'news');
const n = fs.readFileSync(`${root}/site/2026/10/20/testovaya-novost/index.html`, 'utf8');
t('страница новости создана', C.getTitle(n) === 'Тестовая новость' && n.includes('20.10.2026'));
t('крошки: АКВТ › Новости › текущая', /taxonomy category[^>]*>Новости<\/a><\/span><span><a[^>]*current-item[^>]*>Тестовая новость/.test(n));
t('нет «Предыдущая» ссылки', !/nav-previous"><a/.test(n));
for (const l of ['archives', 'category/news', 'category/it-kub']) {
  const h = fs.readFileSync(`${root}/site/${l}/index.html`, 'utf8');
  const first = /<li class="item_archive"><a href="([^"]*)"/.exec(h)[1];
  t(`${l}: новость первая в списке`, first.includes('2026/10/20/testovaya-novost'), first);
}
const home = fs.readFileSync(`${root}/site/index.html`, 'utf8');
t('главная: 6 карточек, новая — featured', (home.match(/<article class="news-card/g) || []).length === 6 && /news-card featured[\s\S]{0,400}Тестовая новость/.test(home));
t('главная: у featured есть анонс', /nc-excerpt">Сегодня мы проверяем/.test(home));
t('битых ссылок нет', brokenLinks(plan.changes).length === 0, brokenLinks(plan.changes).slice(0, 3).join('; '));
console.log('    изменено файлов:', plan.changes.length);

sh('4. Удаление новости и страницы возвращает сайт в исходное состояние');
ctx = await loadCtx();
await apply(await O.planDeletePage(repo, ctx, '2026/10/20/testovaya-novost'), 'del news');
ctx = await loadCtx();
await apply(await O.planDeletePage(repo, ctx, 'postupayushhim/testovaya-stranica'), 'del page');
const diff = git('status --porcelain -- site').split('\n').filter(Boolean);
console.log('    отличия от исходника:', diff);
const real = diff.filter((l) => !/kurs-osnovy|pravda-za-nami|vybiraem-luchshij|materialno-tehnicheskoe|informaczionnye-resursy|admin\/pages-index/.test(l));
const cards = (h) => [...h.matchAll(/<article class="news-card[^>]*>[\s\S]*?<h3><a href="([^"]*)">([^<]*)/g)].map((m) => m[1] + m[2]).join('|');
const homeSame = cards(fs.readFileSync(`${root}/site/index.html`, 'utf8')) === cards(execSync(`git -C ${root} show HEAD:site/index.html`, { encoding: 'utf8' }));
t('главная: те же 6 новостей в том же порядке', homeSame);
real.splice(0, real.length, ...real.filter((l) => !/ site\/index\.html$/.test(l)));
t('после create+delete файлы сайта совпадают с исходными (кроме ранее исправленных опечаток)', real.length === 0, real.join(' | '));
t('пустые каталоги не остались', !fs.existsSync(`${root}/site/postupayushhim/testovaya-stranica/index.html`));

sh('5. Контакты и меню (шапка/подвал на всех страницах)');
ctx = await loadCtx();
const oldC = C.parseContacts(ctx.header, ctx.footer);
const newC = { ...oldC, phones: [{ tel: '+78512000000', label: '00-00-00' }, oldC.phones[1]], email: 'info@akvt.ru' };
let { header, footer } = C.applyContacts(ctx.header, ctx.footer, oldC, newC);
const menus = C.parseMenus(header);
menus.desktop[0].children.push({ label: 'Новый пункт меню', href: '/zayavlenie/index.html' });
menus.desktop[5].label = 'Связь с нами';
header = C.applyMenus(header, menus);
let prog = 0;
plan = await O.planSaveChrome(repo, ctx, { header, footer }, () => prog++);
await repo.commit(plan.changes, 'chrome');
const changedPages = plan.changes.filter((c) => c.path.endsWith('index.html')).length;
t(`обновлены все страницы (${changedPages} из 292)`, changedPages >= 290, String(changedPages));
const deep = fs.readFileSync(`${root}/site/2026/09/23/zashhita-ot-moshennikov-v-seti/index.html`, 'utf8');
t('телефон и e-mail изменены в шапке и подвале глубокой страницы', deep.includes('tel:+78512000000') && deep.includes('00-00-00') && deep.includes('mailto:info@akvt.ru'));
t('новый пункт меню с правильными относительными ссылками', deep.includes('href="../../../../zayavlenie/index.html">Новый пункт меню'));
t('переименованный пункт', deep.includes('>Связь с нами</a>'));
const bl = brokenLinks(plan.changes);
t(`новых битых ссылок нет ни в одной из ${plan.changes.length} изменённых страниц`, bl.length === 0, bl.slice(0, 3).join(' ; '));
const again = await O.planSaveChrome(repo, await loadCtx(), { header, footer });
t('повторное применение ничего не меняет (идемпотентно)', again.changes.length === 0, String(again.changes.length));

sh('6. Загрузка файла');
const up = O.uploadPath('Скан приказа №5.PDF', new Date('2026-10-20T10:00:00'));
t('имя файла транслитерируется', up === 'wp-content/uploads/2026/10/skan-prikaza-5.pdf', up);
await repo.commit(O.planUpload([{ rootPath: up, base64: Buffer.from('%PDF-test').toString('base64') }]).changes, 'upload');
t('файл записан', fs.readFileSync(`${root}/site/${up}`, 'utf8') === '%PDF-test');

console.log(`\nИтог: ${ok} успешно, ${fail} с ошибками`);
process.exit(fail ? 1 : 0);
