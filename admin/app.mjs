import { h, $, toast, modal, closeModal, confirmDlg, fmtSize, fmtDate, fileToBase64, debounce } from './ui.mjs';
import * as C from './core.mjs';
import * as O from './ops.mjs';
import { GitHubRepo } from './github.mjs';
import { createEditor } from './editor.mjs';

const LS = 'akvt_admin_v2';
const S = { repo: null, ctx: null, tree: null, user: null, dirty: false, cfg: null };
const app = document.getElementById('app');
const WAIT = 'Сайт обновится примерно через минуту.';

// ------------------------------------------------------------------ служебное
const pages = () => S.ctx.index.pages;
const sitePages = () => pages().filter((p) => !p.n);
const newsPages = () => pages().filter((p) => p.n).sort((a, b) => b.date.localeCompare(a.date) || a.d.localeCompare(b.d));
const hashFor = (dir) => `#/page/${dir === '' ? '_home' : dir}`;
const dirFromArg = (a) => (a === '_home' ? '' : a);
const labelOf = (p) => (p.d === '' ? 'Главная' : p.t);
async function getTree() { if (!S.tree) S.tree = await S.repo.tree(); return S.tree; }
const mediaList = () => (S.tree || []).filter((f) => /^site\/wp-content\/uploads\/.+\.(png|jpe?g|gif|webp|svg)$/i.test(f.path)).map((f) => f.path.slice(5));

let overlay;
async function busy(text, fn) {
  overlay = h('div', { class: 'busy' }, h('div', { class: 'busy-box' }, h('div', { class: 'spin' }), h('div', { class: 'busy-text' }, text), h('div', { class: 'bar' }, h('i', {}))));
  document.body.append(overlay);
  const set = (t, pct) => { overlay.querySelector('.busy-text').textContent = t; overlay.querySelector('.bar i').style.width = pct == null ? '0%' : `${pct}%`; overlay.querySelector('.bar').style.display = pct == null ? 'none' : 'block'; };
  set(text, null);
  try { return await fn(set); } finally { overlay.remove(); }
}
async function publish(changes, message) {
  if (!changes.length) { toast('Изменений нет — публиковать нечего.', 'info'); return null; }
  const commit = await busy('Публикуем изменения…', () => S.repo.commit(changes, message));
  S.tree = null;
  toast(h('span', {}, `Опубликовано (${changes.length} ${changes.length === 1 ? 'файл' : 'файлов'}). ${WAIT} `, commit && commit.html_url ? h('a', { href: commit.html_url, target: '_blank', rel: 'noopener' }, 'Посмотреть коммит') : ''), 'ok', 12000);
  return commit;
}
const guard = (fn) => async (...a) => { try { return await fn(...a); } catch (e) { console.error(e); toast(e.message || String(e), 'err', 12000); } };
const view = (title, ...kids) => { $('#view').replaceChildren(h('h1', { class: 'page-title' }, title), ...kids); document.title = `${title} — Админка АКВТ`; window.scrollTo(0, 0); };
const siteLink = (dir) => `${location.origin}/${dir ? dir + '/' : ''}`;
const pageList = () => h('datalist', { id: 'pagelist' }, pages().map((p) => h('option', { value: `/${p.d ? p.d + '/' : ''}index.html` }, p.t)));
const setDirty = () => { S.dirty = true; };

// ------------------------------------------------------------------ вход
function loginView(err) {
  const saved = JSON.parse(localStorage.getItem(LS) || '{}');
  const repo = h('input', { type: 'text', value: saved.repo || 'PKSic/akvt' });
  const branch = h('input', { type: 'text', value: saved.branch || 'main' });
  const token = h('input', { type: 'password', placeholder: 'github_pat_…', autocomplete: 'off' });
  const remember = h('input', { type: 'checkbox', checked: saved.remember !== false });
  const go = guard(async () => {
    const [owner, name] = repo.value.trim().split('/');
    if (!owner || !name || !token.value.trim()) { toast('Заполните репозиторий и токен', 'err'); return; }
    await connect({ owner, repo: name, branch: branch.value.trim() || 'main', token: token.value.trim(), remember: remember.checked });
  });
  app.replaceChildren(h('div', { class: 'login' }, h('div', { class: 'login-card' },
    h('div', { class: 'logo' }, 'АКВТ'), h('h1', {}, 'Админ-панель сайта'),
    err ? h('div', { class: 'notice err' }, err) : '',
    h('p', { class: 'muted' }, 'Сайт хранится в GitHub. Админка читает и записывает файлы сайта через ваш токен доступа — поэтому войти можно только владельцу репозитория или тому, кому вы дали доступ.'),
    h('div', { class: 'form' }, h('label', {}, 'Репозиторий', repo), h('label', {}, 'Ветка', branch), h('label', {}, 'Токен доступа GitHub', token),
      h('label', { class: 'check' }, remember, ' Запомнить на этом устройстве')),
    h('button', { class: 'btn primary big', onclick: go }, 'Войти'),
    h('details', {}, h('summary', {}, 'Как получить токен'), h('ol', { class: 'steps' },
      h('li', {}, 'GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.'),
      h('li', {}, 'Repository access: Only select repositories → выберите репозиторий сайта.'),
      h('li', {}, 'Permissions → Repository permissions → Contents: Read and write (больше ничего не нужно).'),
      h('li', {}, 'Скопируйте токен (показывается один раз) и вставьте сюда. Срок действия можно поставить год.'))))));
  token.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
}
async function connect(cfg) {
  const repo = new GitHubRepo(cfg);
  const info = await busy('Подключаемся к GitHub…', async () => {
    const chk = await repo.check();
    if (!chk.canPush) throw new Error('У токена нет права записи в репозиторий (нужно Contents: Read and write).');
    const user = await repo.whoami().catch(() => ({ login: 'GitHub' }));
    const ctx = await O.loadContext(repo);
    return { user, ctx };
  });
  S.repo = repo; S.cfg = cfg; S.user = info.user; S.ctx = info.ctx;
  const store = cfg.remember ? localStorage : sessionStorage;
  localStorage.removeItem(LS); sessionStorage.removeItem(LS);
  store.setItem(LS, JSON.stringify({ token: cfg.token, repo: `${cfg.owner}/${cfg.repo}`, branch: cfg.branch, remember: cfg.remember }));
  shell();
  route();
}
function logout() { localStorage.removeItem(LS); sessionStorage.removeItem(LS); S.repo = null; loginView(); }

// ------------------------------------------------------------------ каркас
const NAV = [
  ['', '🏠', 'Обзор'], ['pages', '📄', 'Страницы'], ['news', '📰', 'Новости'], ['menu', '☰', 'Меню сайта'], ['contacts', '☎', 'Контакты и подвал'],
  ['files', '🖼', 'Файлы и картинки'], ['schedule', '🗓', 'Расписание'], ['links', '🔗', 'Проверка ссылок'], ['history', '🕘', 'История изменений'], ['help', '❓', 'Справка'],
];
function shell() {
  app.replaceChildren(h('div', { class: 'shell' },
    h('aside', { class: 'side' }, h('a', { class: 'brand', href: '#/' }, h('b', {}, 'АКВТ'), h('span', {}, 'админ-панель')),
      h('nav', { id: 'nav' }, NAV.map(([k, ico, name]) => h('a', { href: `#/${k}`, 'data-k': k, onclick: navGuard }, h('i', {}, ico), name))),
      h('div', { class: 'side-foot' }, h('a', { href: location.origin + '/', target: '_blank', rel: 'noopener' }, 'Открыть сайт ↗'),
        h('div', { class: 'who' }, S.user ? `${S.user.login} · ${S.cfg.owner}/${S.cfg.repo}` : ''), h('button', { class: 'link', onclick: logout }, 'Выйти'))),
    h('main', { id: 'view' })));
  document.body.append(pageList());
}
function navGuard(e) {
  if (S.dirty && !confirm('На странице есть несохранённые изменения. Уйти без сохранения?')) e.preventDefault();
  else S.dirty = false;
}
window.addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

// ------------------------------------------------------------------ роутер
const ROUTES = { '': viewDash, pages: viewPages, news: viewNews, menu: viewMenu, contacts: viewContacts, files: viewFiles, schedule: viewSchedule, links: viewLinks, history: viewHistory, help: viewHelp,
  page: viewPage, 'new-page': viewNewPage, 'new-news': viewNewNews };
async function route() {
  if (!S.repo) return;
  const hash = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [name, ...rest] = hash.split('/');
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.k === (name === 'page' || name === 'new-page' ? 'pages' : name === 'new-news' ? 'news' : name)));
  S.dirty = false;
  const fn = ROUTES[name] || viewDash;
  $('#view').replaceChildren(h('div', { class: 'loading' }, 'Загрузка…'));
  try { await fn(rest.join('/')); } catch (e) { console.error(e); $('#view').replaceChildren(h('div', { class: 'notice err' }, e.message || String(e))); }
}
window.addEventListener('hashchange', route);

// ------------------------------------------------------------------ обзор
async function viewDash() {
  const hist = await S.repo.history(null, 8).catch(() => []);
  view('Обзор',
    h('div', { class: 'cards' },
      h('a', { class: 'card', href: '#/new-news' }, h('b', {}, '＋ Новость'), h('span', {}, 'Написать и опубликовать новость')),
      h('a', { class: 'card', href: '#/new-page' }, h('b', {}, '＋ Страница'), h('span', {}, 'Создать новую страницу раздела')),
      h('a', { class: 'card', href: hashFor('') }, h('b', {}, 'Главная страница'), h('span', {}, 'Тексты, картинки, блоки')),
      h('a', { class: 'card', href: '#/menu' }, h('b', {}, 'Меню сайта'), h('span', {}, 'Пункты шапки на всех страницах')),
      h('a', { class: 'card', href: '#/files' }, h('b', {}, 'Файлы'), h('span', {}, 'Загрузить PDF, картинки')),
      h('a', { class: 'card', href: '#/schedule' }, h('b', {}, 'Расписание'), h('span', {}, 'Заменить файлы расписания'))),
    h('div', { class: 'stats' }, h('div', {}, h('b', {}, sitePages().length), ' страниц'), h('div', {}, h('b', {}, newsPages().length), ' новостей')),
    h('div', { class: 'notice info' }, h('b', {}, 'Как это работает. '), 'Каждое «Сохранить» — это коммит в GitHub. Vercel публикует сайт сам, обычно за минуту. Любую ошибку можно откатить во вкладке «История изменений».'),
    h('h2', {}, 'Последние изменения'), histTable(hist));
}
function histTable(list) {
  if (!list.length) return h('p', { class: 'muted' }, 'Истории пока нет.');
  return h('table', { class: 'tbl' }, h('tbody', {}, list.map((c) => h('tr', {}, h('td', { class: 'nw' }, fmtDate(c.date)), h('td', {}, c.message), h('td', { class: 'muted' }, c.author), h('td', {}, h('a', { href: c.url, target: '_blank', rel: 'noopener' }, 'GitHub ↗'))))));
}
async function viewHistory() { view('История изменений', histTable(await S.repo.history(null, 40))); }

// ------------------------------------------------------------------ список страниц
function viewPages() {
  const q = h('input', { type: 'search', placeholder: 'Поиск по названию или адресу…', class: 'search' });
  const sections = [...new Set(sitePages().map((p) => p.d.split('/')[0]))].filter(Boolean).sort();
  const sec = h('select', {}, h('option', { value: '' }, 'Все разделы'), sections.map((s) => h('option', { value: s }, `/${s}/ — ${(sitePages().find((p) => p.d === s) || {}).t || ''}`)));
  const tbody = h('tbody');
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const rows = sitePages().filter((p) => (!sec.value || p.d === sec.value || p.d.startsWith(sec.value + '/')) && (!t || p.t.toLowerCase().includes(t) || p.d.toLowerCase().includes(t)))
      .sort((a, b) => a.d.localeCompare(b.d));
    tbody.replaceChildren(...rows.map((p) => h('tr', {}, h('td', { style: { paddingLeft: `${10 + C.depthOf(p.d) * 18}px` } }, h('a', { href: hashFor(p.d) }, labelOf(p))), h('td', { class: 'muted mono' }, `/${p.d}`),
      h('td', { class: 'right nw' }, h('a', { class: 'btn sm', href: hashFor(p.d) }, 'Редактировать'), ' ', h('a', { class: 'btn sm', href: siteLink(p.d), target: '_blank', rel: 'noopener' }, 'Открыть ↗')))));
    count.textContent = `${rows.length} из ${sitePages().length}`;
  };
  const count = h('span', { class: 'muted' });
  q.addEventListener('input', debounce(draw, 120)); sec.addEventListener('change', draw);
  view('Страницы', h('div', { class: 'toolbar-row' }, q, sec, count, h('a', { class: 'btn primary', href: '#/new-page' }, '＋ Новая страница')), h('table', { class: 'tbl' }, tbody));
  draw();
}
function viewNews() {
  const q = h('input', { type: 'search', placeholder: 'Поиск по заголовку…', class: 'search' });
  const tbody = h('tbody'); const count = h('span', { class: 'muted' });
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const rows = newsPages().filter((p) => !t || p.t.toLowerCase().includes(t));
    tbody.replaceChildren(...rows.slice(0, 300).map((p) => h('tr', {}, h('td', { class: 'nw muted' }, p.date.split('-').reverse().join('.')), h('td', {}, h('a', { href: hashFor(p.d) }, p.t)),
      h('td', { class: 'right nw' }, h('a', { class: 'btn sm', href: hashFor(p.d) }, 'Редактировать'), ' ', h('a', { class: 'btn sm', href: siteLink(p.d), target: '_blank', rel: 'noopener' }, 'Открыть ↗')))));
    count.textContent = `${rows.length} новостей`;
  };
  q.addEventListener('input', debounce(draw, 120));
  view('Новости', h('div', { class: 'toolbar-row' }, q, count, h('a', { class: 'btn primary', href: '#/new-news' }, '＋ Новая новость')), h('table', { class: 'tbl' }, tbody));
  draw();
}

// ------------------------------------------------------------------ редактор страницы
async function viewPage(arg) {
  const dir = dirFromArg(arg);
  const entry = pages().find((p) => p.d === dir);
  if (!entry) throw new Error('Страница не найдена в индексе: /' + dir);
  let original = await S.repo.read(C.siteFile(dir));
  if (original == null) throw new Error('Файл страницы не найден в репозитории');
  await getTree();
  const isNews = !!entry.n;
  const title = h('input', { type: 'text', class: 'wide', value: C.getTitle(original) || entry.t, oninput: setDirty });
  const desc = h('textarea', { rows: 3, class: 'wide', oninput: setDirty }, C.getDescription(original));
  const full = h('textarea', { class: 'ed-code tall', spellcheck: 'false' }, original);
  let fullTouched = false;
  full.addEventListener('input', () => { fullTouched = true; setDirty(); });
  const editor = createEditor({ srcHtml: original, dir, pages, media: mediaList, onDirty: setDirty });
  const panels = {
    content: h('div', {}, editor.el),
    params: h('div', { class: 'form' }, h('label', {}, 'Заголовок страницы', title), h('label', {}, 'Описание для поисковиков (необязательно)', desc),
      h('label', {}, 'Адрес', h('input', { type: 'text', class: 'wide mono', value: siteLink(dir), readonly: true })),
      isNews ? h('p', { class: 'muted' }, `Дата публикации: ${entry.date.split('-').reverse().join('.')}. Дата берётся из адреса страницы.`) : ''),
    full: h('div', {}, h('div', { class: 'notice warn' }, 'Для опытных. Если вы правите здесь, изменения из других вкладок не применяются — сохраняется именно этот текст.'), full),
  };
  const tabBar = h('div', { class: 'tabs' });
  const show = (k) => { Object.entries(panels).forEach(([n, el]) => { el.style.display = n === k ? 'block' : 'none'; }); [...tabBar.children].forEach((b) => b.classList.toggle('active', b.dataset.k === k)); };
  [['content', 'Содержимое'], ['params', 'Параметры'], ['full', 'Весь файл (HTML)']].forEach(([k, n]) => tabBar.append(h('button', { type: 'button', 'data-k': k, onclick: () => show(k) }, n)));

  const save = guard(async () => {
    const plan = await busy('Готовим изменения…', () => O.planSavePage(S.repo, S.ctx, {
      dir, original, fullHtml: fullTouched ? full.value : null, inner: editor.supported && !fullTouched ? editor.getInner() : null,
      title: title.value.trim(), description: desc.value,
    }));
    const uploads = fullTouched ? [] : editor.pending().map((f) => ({ path: `site/${f.rootPath}`, base64: f.base64 }));
    const changes = [...plan.changes, ...uploads];
    const commit = await publish(changes, `Админка: изменена страница «${title.value.trim() || entry.t}» (/${dir})`);
    if (!commit) return;
    S.ctx.index = plan.index;
    const nf = changes.find((c) => c.path === C.siteFile(dir));
    if (nf) { original = nf.content; full.value = original; fullTouched = false; }
    S.dirty = false;
  });
  const history = guard(async () => {
    const list = await S.repo.history(C.siteFile(dir), 15);
    modal({ title: 'История страницы', wide: true, body: list.length ? h('table', { class: 'tbl' }, h('tbody', {}, list.map((c) => h('tr', {}, h('td', { class: 'nw' }, fmtDate(c.date)), h('td', {}, c.message),
      h('td', { class: 'right' }, h('button', { class: 'btn sm', onclick: guard(async () => {
        const old = await S.repo.readAt(C.siteFile(dir), c.sha); const e = C.getEditable(old);
        if (e && editor.supported) await editor.setInner(e.inner);
        title.value = C.getTitle(old) || title.value; desc.value = C.getDescription(old); setDirty();
        closeModal(); toast('Версия загружена в редактор. Проверьте и нажмите «Сохранить».', 'info');
      }) }, 'Загрузить в редактор')))))) : h('p', {}, 'Истории нет.'), buttons: [{ text: 'Закрыть' }] });
  });
  const protectedDirs = ['', 'archives', 'karta-sajta', 'category/news', 'category/it-kub', 'zayavlenie'];
  const del = guard(async () => {
    const inMenu = S.ctx.header.includes(`/${dir}/index.html`);
    const warn = inMenu ? ' ВНИМАНИЕ: на эту страницу ссылается меню сайта — после удаления пункт станет битой ссылкой, его нужно убрать во вкладке «Меню сайта».' : '';
    if (!(await confirmDlg(`Удалить «${entry.t}» навсегда? Страница исчезнет с сайта, из бокового меню раздела и карты сайта. Восстановить можно из истории GitHub.${warn}`, 'Удалить'))) return;
    const plan = await busy('Готовим удаление…', () => O.planDeletePage(S.repo, S.ctx, dir));
    if (await publish(plan.changes, `Админка: удалена страница «${entry.t}» (/${dir})`)) { S.ctx.index = plan.index; S.dirty = false; location.hash = isNews ? '#/news' : '#/pages'; }
  });
  view(isNews ? 'Новость' : (dir === '' ? 'Главная страница' : 'Страница'),
    h('div', { class: 'ed-head' }, h('div', {}, h('div', { class: 'ed-title' }, entry.t), h('a', { class: 'muted mono', href: siteLink(dir), target: '_blank', rel: 'noopener' }, `/${dir} ↗`)),
      h('div', { class: 'ed-actions' }, h('button', { class: 'btn', onclick: history }, '🕘 История'), protectedDirs.includes(dir) ? '' : h('button', { class: 'btn danger', onclick: del }, 'Удалить'), h('button', { class: 'btn primary', onclick: save }, 'Сохранить и опубликовать'))),
    tabBar, panels.content, panels.params, panels.full);
  show('content');
  if (dir === 'archives' || dir === 'category/news' || dir === 'category/it-kub') $('#view').prepend(h('div', { class: 'notice info' }, 'Этот список обновляется автоматически при добавлении и удалении новостей.'));
}

// ------------------------------------------------------------------ новая страница / новость
function slugInput(titleEl) {
  const slug = h('input', { type: 'text', class: 'mono', placeholder: 'adres-stranicy' });
  let manual = false;
  slug.addEventListener('input', () => { manual = true; });
  titleEl.addEventListener('input', () => { if (!manual) slug.value = C.slugify(titleEl.value); });
  return slug;
}
async function viewNewPage(arg) {
  await getTree();
  const title = h('input', { type: 'text', class: 'wide', placeholder: 'Например: Дни открытых дверей' });
  const slug = slugInput(title);
  const parent = h('select', {}, h('option', { value: '' }, '/ (верхний уровень сайта)'),
    sitePages().filter((p) => p.d).sort((a, b) => a.d.localeCompare(b.d)).map((p) => h('option', { value: p.d, selected: p.d === arg }, `${'— '.repeat(C.depthOf(p.d) - 1)}${p.t}  (/${p.d})`)));
  const addr = h('div', { class: 'muted mono' });
  const upd = () => { addr.textContent = `Адрес: /${parent.value ? parent.value + '/' : ''}${slug.value || '…'}/`; };
  [parent, slug, title].forEach((e) => e.addEventListener('input', upd)); upd();
  const slot = h('div');
  const next = guard(async () => {
    const t = title.value.trim(); const s = slug.value.trim();
    if (!t) throw new Error('Введите название страницы');
    const dir = parent.value ? `${parent.value}/${s}` : s;
    const err = O.validateNewDir(S.ctx.index, dir); if (err) throw new Error(err);
    const tpl = await busy('Готовим шаблон…', () => O.pickTemplate(S.repo, S.ctx.index, parent.value));
    const html = C.setEditable(C.rebase(tpl.html, tpl.dir, dir), '<p><br></p>');
    const editor = createEditor({ srcHtml: html, dir, pages, media: mediaList, onDirty: setDirty });
    const publishIt = guard(async () => {
      const body = editor.getInner();
      const plan = await busy('Создаём страницу…', () => O.planCreatePage(S.repo, S.ctx, { parentDir: parent.value, title: t, slug: s, body }));
      const uploads = editor.pending().map((f) => ({ path: `site/${f.rootPath}`, base64: f.base64 }));
      if (await publish([...plan.changes, ...uploads], `Админка: новая страница «${t}» (/${plan.dir})`)) { S.ctx.index = plan.index; S.dirty = false; location.hash = hashFor(plan.dir); }
    });
    slot.replaceChildren(h('div', { class: 'ed-head' }, h('div', {}, h('div', { class: 'ed-title' }, t), h('div', { class: 'muted mono' }, `/${dir}/`)),
      h('div', { class: 'ed-actions' }, h('button', { class: 'btn', onclick: () => { slot.replaceChildren(); form.style.display = 'block'; } }, '← Назад'), h('button', { class: 'btn primary', onclick: publishIt }, 'Опубликовать страницу'))), editor.el);
    form.style.display = 'none';
  });
  const form = h('div', { class: 'form box' }, h('label', {}, 'Раздел (куда поместить страницу)', parent), h('label', {}, 'Название страницы', title), h('label', {}, 'Адрес (латиницей)', slug), addr,
    h('div', {}, h('button', { class: 'btn primary', onclick: next }, 'Далее — написать текст →')));
  view('Новая страница', form, slot);
}
async function viewNewNews() {
  await getTree();
  const title = h('input', { type: 'text', class: 'wide', placeholder: 'Заголовок новости' });
  const slug = slugInput(title);
  const date = h('input', { type: 'date', value: C.todayIso() });
  const itkub = h('input', { type: 'checkbox' });
  const tplEntry = C.latestNews(S.ctx.index, 50).find((p) => p.d.split('/').length === 4);
  const tplHtml = await S.repo.read(C.siteFile(tplEntry.d));
  const editor = createEditor({ srcHtml: C.setEditable(tplHtml, '<p><br></p>'), dir: tplEntry.d, pages, media: mediaList, onDirty: setDirty });
  const go = guard(async () => {
    const t = title.value.trim(); if (!t) throw new Error('Введите заголовок');
    if (!date.value) throw new Error('Укажите дату');
    const plan = await busy('Создаём новость…', () => O.planCreateNews(S.repo, S.ctx, { title: t, slug: slug.value.trim(), dateIso: date.value, body: editor.getInner(), itKub: itkub.checked }));
    const uploads = editor.pending().map((f) => ({ path: `site/${f.rootPath}`, base64: f.base64 }));
    if (await publish([...plan.changes, ...uploads], `Админка: новость «${t}»`)) { S.ctx.index = plan.index; S.dirty = false; location.hash = hashFor(plan.dir); }
  });
  view('Новая новость', h('div', { class: 'form box' }, h('label', {}, 'Заголовок', title), h('div', { class: 'row' }, h('label', {}, 'Дата', date), h('label', { class: 'grow' }, 'Адрес (латиницей)', slug)),
    h('label', { class: 'check' }, itkub, ' Показывать также в рубрике «IT-Куб»')),
    h('div', { class: 'muted' }, 'Новость сразу появится на главной, в «Все новости» и в рубрике. Текст пишите ниже — как на сайте.'), editor.el,
    h('div', { class: 'ed-actions bottom' }, h('button', { class: 'btn primary big', onclick: go }, 'Опубликовать новость')));
}

// ------------------------------------------------------------------ меню
async function saveChrome(header, footer, message) {
  const plan = await busy('Применяем ко всем страницам…', (set) => O.planSaveChrome(S.repo, S.ctx, { header, footer }, (d, t) => set(`Проверено страниц: ${d} из ${t}`, Math.round((d / t) * 100))));
  if (!plan.changes.length) { toast('Изменений нет.', 'info'); return; }
  if (await publish(plan.changes, message)) { S.ctx.header = header; S.ctx.footer = footer; S.dirty = false; }
}
function urlInput(value, onInput) {
  return h('input', { type: 'text', class: 'url', list: 'pagelist', value, placeholder: '/раздел/страница/index.html или https://…', oninput: (e) => { onInput(e.target.value); setDirty(); } });
}
function viewMenu() {
  const M = structuredClone(C.parseMenus(S.ctx.header));
  const box = h('div');
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; draw(); setDirty(); };
  const itemRow = (arr, i, it, level, hasFoot) => {
    if (it.raw) return h('div', { class: 'mi locked' }, h('span', { class: 'muted' }, '📱 «Добавить на экран» — служебная кнопка, остаётся на месте'));
    const kids = it.children && it.children.length ? it.children : null;
    return h('div', { class: `mi lvl${level}` },
      h('div', { class: 'mi-row' },
        h('input', { type: 'text', class: 'lbl', value: it.label, placeholder: 'Название', oninput: (e) => { it.label = e.target.value; setDirty(); } }), urlInput(it.href, (v) => { it.href = v; }),
        h('span', { class: 'mi-btns' }, h('button', { class: 'ic', title: 'Выше', onclick: () => move(arr, i, -1) }, '↑'), h('button', { class: 'ic', title: 'Ниже', onclick: () => move(arr, i, 1) }, '↓'),
          h('button', { class: 'ic danger', title: 'Удалить', onclick: () => { arr.splice(i, 1); draw(); setDirty(); } }, '✕'))),
      level === 0 ? h('div', { class: 'mi-kids' }, (it.children || []).map((c, j) => itemRow(it.children, j, c, 1)),
        h('button', { class: 'btn sm', onclick: () => { (it.children = it.children || []).push({ label: 'Новый пункт', href: '/' }); draw(); setDirty(); } }, '＋ подпункт'),
        hasFoot && it.children && it.children.length ? h('div', { class: 'mi-foot' }, h('span', { class: 'muted' }, 'Нижняя ссылка выпадающего меню:'),
          h('input', { type: 'text', class: 'lbl', value: it.foot ? it.foot.label : '', placeholder: 'Например: Все материалы', oninput: (e) => { it.foot = it.foot || { label: '', href: it.href }; it.foot.label = e.target.value; setDirty(); } }),
          urlInput(it.foot ? it.foot.href : it.href, (v) => { it.foot = it.foot || { label: '', href: v }; it.foot.href = v; })) : '') : '');
  };
  const draw = () => {
    box.replaceChildren(
      h('h2', {}, 'Основное меню (компьютер)'), h('div', { class: 'mlist' }, M.desktop.map((it, i) => itemRow(M.desktop, i, it, 0, true))),
      h('button', { class: 'btn', onclick: () => { M.desktop.push({ label: 'Новый пункт', href: '/', children: [] }); draw(); setDirty(); } }, '＋ Пункт меню'),
      h('h2', {}, 'Мобильное меню (телефон)'), h('p', { class: 'muted' }, 'Отдельный, более короткий список — как на сайте сейчас.'),
      h('div', { class: 'mlist' }, M.mobile.map((it, i) => itemRow(M.mobile, i, it, 0, false))),
      h('button', { class: 'btn', onclick: () => { M.mobile.push({ label: 'Новый пункт', href: '/', children: [] }); draw(); setDirty(); } }, '＋ Пункт меню'));
  };
  draw();
  const save = guard(async () => {
    const clean = (arr) => arr.filter((x) => x.raw || (x.label && x.label.trim() && x.href && x.href.trim())).map((x) => (x.raw ? x : { ...x, children: (x.children || []).filter((c) => c.label.trim() && c.href.trim()), foot: x.foot && x.foot.label.trim() ? x.foot : null }));
    const header = C.applyMenus(S.ctx.header, { desktop: clean(M.desktop), mobile: clean(M.mobile) });
    await saveChrome(header, S.ctx.footer, 'Админка: изменено меню сайта');
  });
  view('Меню сайта', h('div', { class: 'notice info' }, 'Меню одинаково на всех страницах. При сохранении оно обновится на каждой из них (около 300 файлов, одним коммитом).'),
    box, h('div', { class: 'ed-actions bottom' }, h('button', { class: 'btn primary big', onclick: save }, 'Сохранить меню на всех страницах')));
}
function viewContacts() {
  const old = C.parseContacts(S.ctx.header, S.ctx.footer);
  const inp = (v, ph = '') => h('input', { type: 'text', class: 'wide', value: v, placeholder: ph, oninput: setDirty });
  const f = {
    ticker: inp(old.ticker), address: inp(old.address), email: inp(old.email), vk: inp(old.vk), ok: inp(old.ok), tg: inp(old.tg), copy: inp(old.copy),
    p: old.phones.map((p) => ({ tel: inp(p.tel), label: inp(p.label) })),
  };
  const hdr = h('textarea', { class: 'ed-code', rows: 12, spellcheck: 'false', oninput: setDirty }, S.ctx.header);
  const ftr = h('textarea', { class: 'ed-code', rows: 12, spellcheck: 'false', oninput: setDirty }, S.ctx.footer);
  const save = guard(async () => {
    let header = S.ctx.header; let footer = S.ctx.footer;
    if (hdr.value !== S.ctx.header || ftr.value !== S.ctx.footer) { header = hdr.value; footer = ftr.value; }
    else {
      const nc = { ticker: f.ticker.value, address: f.address.value, email: f.email.value.trim(), vk: f.vk.value.trim(), ok: f.ok.value.trim(), tg: f.tg.value.trim(), copy: f.copy.value,
        phones: f.p.map((p) => ({ tel: p.tel.value.trim(), label: p.label.value.trim() })) };
      ({ header, footer } = C.applyContacts(header, footer, old, nc));
    }
    await saveChrome(header, footer, 'Админка: изменены контакты и подвал сайта');
  });
  view('Контакты и подвал', h('div', { class: 'notice info' }, 'Эти данные показываются в верхней строке и в подвале каждой страницы. Телефоны внутри текста страниц (например, блок «Как добраться» на главной) правятся в редакторе самой страницы.'),
    h('div', { class: 'form box' }, h('label', {}, 'Сообщение в верхней строке', f.ticker), h('label', {}, 'Адрес', f.address),
      f.p.map((p, i) => h('div', { class: 'row' }, h('label', { class: 'grow' }, `Телефон ${i + 1} (как показывать)`, p.label), h('label', { class: 'grow' }, 'Номер для звонка (+7…)', p.tel))),
      h('label', {}, 'E-mail', f.email), h('label', {}, 'ВКонтакте', f.vk), h('label', {}, 'Одноклассники', f.ok), h('label', {}, 'Telegram', f.tg), h('label', {}, 'Строка авторских прав (HTML)', f.copy)),
    h('details', {}, h('summary', {}, 'Для опытных: HTML шапки и подвала'), h('label', {}, 'Шапка (partials/header.html)', hdr), h('label', {}, 'Подвал (partials/footer.html)', ftr)),
    h('div', { class: 'ed-actions bottom' }, h('button', { class: 'btn primary big', onclick: save }, 'Сохранить на всех страницах')));
}

// ------------------------------------------------------------------ файлы
async function viewFiles() {
  const tree = await getTree();
  const q = h('input', { type: 'search', placeholder: 'Поиск файла…', class: 'search' });
  const grid = h('div', { class: 'files' });
  const input = h('input', { type: 'file', multiple: true });
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const list = (S.tree || tree).filter((f) => f.path.startsWith('site/wp-content/uploads/') && (!t || f.path.toLowerCase().includes(t))).sort((a, b) => b.path.localeCompare(a.path));
    grid.replaceChildren(...list.map((f) => {
      const root = f.path.slice(5); const img = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.path);
      return h('div', { class: 'file' }, img ? h('img', { src: `/${root}`, loading: 'lazy' }) : h('div', { class: 'ext' }, f.path.split('.').pop().toUpperCase()),
        h('div', { class: 'fname', title: root }, root.replace('wp-content/uploads/', '')), h('div', { class: 'muted' }, fmtSize(f.size || 0)),
        h('div', { class: 'fbtn' }, h('button', { class: 'btn sm', onclick: () => navigator.clipboard.writeText(`/${root}`).then(() => toast('Ссылка скопирована: /' + root, 'info', 3000)) }, 'Копировать ссылку'),
          h('button', { class: 'btn sm danger', onclick: guard(async () => {
            if (!(await confirmDlg(`Удалить файл ${root}? Если он используется на страницах, там появятся битые ссылки.`, 'Удалить'))) return;
            if (await publish([{ path: f.path, delete: true }], `Админка: удалён файл ${root}`)) viewFiles();
          }) }, 'Удалить')));
    }));
  };
  q.addEventListener('input', debounce(draw, 120));
  const upload = guard(async () => {
    const files = [...input.files]; if (!files.length) { toast('Выберите файлы', 'err'); return; }
    const big = files.find((f) => f.size > 25e6); if (big) throw new Error(`Файл «${big.name}» больше 25 МБ — GitHub его не примет`);
    const changes = await busy('Читаем файлы…', async () => Promise.all(files.map(async (f) => ({ rootPath: O.uploadPath(f.name), base64: await fileToBase64(f) }))));
    if (await publish(O.planUpload(changes).changes, `Админка: загружено файлов — ${files.length}`)) viewFiles();
  });
  view('Файлы и картинки', h('div', { class: 'form box' }, h('label', {}, 'Загрузить файлы (PDF, документы, картинки)', input), h('div', {}, h('button', { class: 'btn primary', onclick: upload }, 'Загрузить'))),
    h('p', { class: 'muted' }, 'Файлы попадают в папку «wp-content/uploads». Чтобы вставить файл или картинку в текст, используйте кнопки 🖼 и 📎 в редакторе страницы.'), h('div', { class: 'toolbar-row' }, q), grid);
  draw();
}

// ------------------------------------------------------------------ расписание
const FILES_RE = /var FILES = \[([\s\S]*?)\];/;
async function viewSchedule() {
  const tree = await getTree();
  const SCHED_PAGES = ['students/raspisanie-zanyatij', 'teachers/raspisanie-zanyatij'];
  const src = await S.repo.read(C.siteFile(SCHED_PAGES[0]));
  const m = src && FILES_RE.exec(src);
  if (!m) throw new Error('На странице расписания не найден список файлов (var FILES = […])');
  const files = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  const rootOf = (rel) => C.resolveToRoot(SCHED_PAGES[0], rel);
  const sizeOf = (root) => { const f = tree.find((x) => x.path === `site/${root}`); return f ? fmtSize(f.size || 0) : 'нет файла'; };
  const proxyOf = (root) => { const n = root.split('/').pop().replace(/^bolshoe-raspisanie-/, ''); return tree.some((x) => x.path === `site/_xls-proxy/${n}`) ? `site/_xls-proxy/${n}` : null; };
  const rewriteList = async (nextFiles, extra, msg) => {
    const changes = [...extra];
    for (const p of SCHED_PAGES) {
      const html = await S.repo.read(C.siteFile(p)); if (!html) continue;
      const lines = nextFiles.map((f) => `  "${C.relFromDir(p, resolveRoot(f))}"`).join(',\n');
      const n = html.replace(FILES_RE, `var FILES = [\n${lines}\n];`);
      if (n !== html) changes.push({ path: C.siteFile(p), content: n });
    }
    if (await publish(changes, msg)) viewSchedule();
  };
  const resolveRoot = (relOrRoot) => (relOrRoot.startsWith('wp-content') ? relOrRoot : rootOf(relOrRoot));
  const rows = files.map((rel) => {
    const root = rootOf(rel);
    const inp = h('input', { type: 'file', accept: '.xls,.xlsx' });
    return h('tr', {}, h('td', { class: 'mono' }, root.split('/').pop()), h('td', { class: 'muted nw' }, sizeOf(root)), h('td', {}, inp),
      h('td', { class: 'right nw' }, h('button', { class: 'btn sm primary', onclick: guard(async () => {
        const f = inp.files[0]; if (!f) throw new Error('Выберите файл расписания');
        if (!/\.xls$/i.test(f.name)) throw new Error('Загрузите файл в формате .xls (как текущий) — сайт читает именно его');
        const base64 = await fileToBase64(f); const ch = [{ path: `site/${root}`, base64 }]; const px = proxyOf(root); if (px) ch.push({ path: px, base64 });
        if (await publish(ch, `Админка: обновлён файл расписания ${root.split('/').pop()}`)) viewSchedule();
      }) }, 'Заменить'), ' ', h('button', { class: 'btn sm danger', onclick: guard(async () => {
        if (!(await confirmDlg('Убрать этот файл из списка расписания на сайте? Сам файл останется в репозитории.', 'Убрать'))) return;
        await rewriteList(files.filter((x) => x !== rel).map(rootOf), [], `Админка: файл ${root.split('/').pop()} убран из расписания`);
      }) }, 'Убрать из списка')));
  });
  const nf = h('input', { type: 'file', accept: '.xls' });
  view('Расписание занятий', h('div', { class: 'notice info' }, 'Страницы «Расписание» для студентов и преподавателей читают эти файлы. «Заменить» загружает новую версию под тем же именем — расписание на сайте обновится.'),
    h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, 'Файл'), h('th', {}, 'Размер'), h('th', {}, 'Новая версия'), h('th', {}))), h('tbody', {}, rows)),
    h('h2', {}, 'Добавить ещё один файл расписания'), h('div', { class: 'form box' }, h('label', {}, 'Файл .xls', nf), h('div', {}, h('button', { class: 'btn', onclick: guard(async () => {
      const f = nf.files[0]; if (!f) throw new Error('Выберите файл'); if (!/\.xls$/i.test(f.name)) throw new Error('Нужен формат .xls');
      const root = O.uploadPath(f.name); const base64 = await fileToBase64(f);
      await rewriteList([...files.map(rootOf), root], [{ path: `site/${root}`, base64 }], `Админка: добавлен файл расписания ${root.split('/').pop()}`);
    }) }, 'Добавить в расписание'))));
}

// ------------------------------------------------------------------ проверка ссылок
async function viewLinks() {
  const out = h('div'); const prog = h('div', { class: 'muted' });
  const run = guard(async () => {
    const tree = await getTree(); const files = new Set(tree.map((f) => f.path));
    const exists = (p) => { p = decodeURIComponent(p.replace(/^\//, '')); if (p === '' || p.endsWith('/')) p += 'index.html'; return files.has(`site/${p}`) || files.has(`site/${p}/index.html`) || files.has(p); };
    const list = pages(); let done = 0; const bad = []; const queue = [...list];
    const worker = async () => {
      while (queue.length) {
        const p = queue.shift();
        try {
          const base = `${location.origin}/${p.d ? p.d + '/' : ''}`;
          const html = await (await fetch(base, { cache: 'no-store' })).text();
          const doc = new DOMParser().parseFromString(html, 'text/html'); const seen = new Set();
          for (const el of doc.querySelectorAll('a[href],img[src]')) {
            const u = el.getAttribute('href') || el.getAttribute('src');
            if (!u || /^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(u)) continue;
            let url; try { url = new URL(u, base); } catch { continue; }
            if (url.origin !== location.origin || seen.has(url.pathname)) continue; seen.add(url.pathname);
            if (!exists(url.pathname)) bad.push({ page: p, link: u });
          }
        } catch (e) { bad.push({ page: p, link: `(страница не загрузилась: ${e.message})` }); }
        prog.textContent = `Проверено ${++done} из ${list.length}`;
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    prog.textContent = `Готово: проверено ${list.length} страниц, найдено проблем — ${bad.length}.`;
    const by = new Map(); bad.forEach((b) => { if (!by.has(b.page.d)) by.set(b.page.d, { page: b.page, links: [] }); by.get(b.page.d).links.push(b.link); });
    out.replaceChildren(by.size ? h('table', { class: 'tbl' }, h('tbody', {}, [...by.values()].map((x) => h('tr', {}, h('td', {}, h('a', { href: hashFor(x.page.d) }, labelOf(x.page)), h('div', { class: 'muted mono' }, `/${x.page.d}`)),
      h('td', { class: 'mono small' }, x.links.map((l) => h('div', {}, l))))))) : h('div', { class: 'notice ok' }, 'Битых ссылок и картинок не найдено.'));
  });
  view('Проверка ссылок', h('p', { class: 'muted' }, 'Скачивает каждую страницу опубликованного сайта и проверяет, что ссылки на другие страницы, файлы и картинки внутри сайта ведут на существующие файлы. Внешние сайты не проверяются.'),
    h('button', { class: 'btn primary', onclick: run }, 'Запустить проверку'), prog, out);
}

// ------------------------------------------------------------------ справка
function viewHelp() {
  view('Справка', h('div', { class: 'help' },
    h('h2', {}, 'Как работает админка'), h('p', {}, 'Весь сайт — набор файлов в репозитории GitHub. Админка открывает нужный файл, вы правите текст, а при сохранении она записывает изменение в репозиторий. Vercel замечает новый коммит и публикует сайт — это занимает около минуты.'),
    h('h2', {}, 'Что можно делать'), h('ul', {},
      h('li', {}, h('b', {}, 'Страницы'), ' — править текст, картинки, ссылки, таблицы; создавать новые страницы в любом разделе; удалять.'),
      h('li', {}, h('b', {}, 'Новости'), ' — писать новости: они сами попадут на главную, в «Все новости» и в рубрики.'),
      h('li', {}, h('b', {}, 'Меню сайта'), ' и ', h('b', {}, 'Контакты'), ' — меняются сразу на всех страницах.'),
      h('li', {}, h('b', {}, 'Файлы'), ' — загрузка PDF и картинок; ', h('b', {}, 'Расписание'), ' — замена файлов расписания.'),
      h('li', {}, h('b', {}, 'Проверка ссылок'), ' — находит битые ссылки и картинки.')),
    h('h2', {}, 'Если что-то пошло не так'), h('p', {}, 'Откройте страницу → «История» → загрузите прежнюю версию в редактор → «Сохранить». Либо откатите коммит прямо на GitHub.'),
    h('h2', {}, 'Безопасность'), h('p', {}, 'Доступ определяется токеном GitHub. Не передавайте его другим. Если токен утёк — удалите его в настройках GitHub и создайте новый. Чтобы дать доступ другому человеку, добавьте его в репозиторий (Settings → Collaborators): у него будет свой токен.'),
    h('h2', {}, 'Ограничения'), h('ul', {},
      h('li', {}, 'Формы на сайте (заявление, обращения) в админке не настраиваются — это отдельные скрипты.'),
      h('li', {}, 'Картинки, подключённые ссылкой на akvt.ru, остаются там; новые лучше загружать сюда.'),
      h('li', {}, 'Пока открыта правка, другой человек, сохранивший ту же страницу, может быть перезаписан — работайте над одной страницей по очереди.'))));
}

// ------------------------------------------------------------------ запуск
async function start() {
  const raw = localStorage.getItem(LS) || sessionStorage.getItem(LS);
  if (raw) {
    try {
      const s = JSON.parse(raw); const [owner, repo] = s.repo.split('/');
      await connect({ owner, repo, branch: s.branch, token: s.token, remember: s.remember });
      return;
    } catch (e) { console.error(e); loginView('Не удалось войти автоматически: ' + e.message); return; }
  }
  loginView();
}
start();
