import { ico } from './icons.mjs';
// Визуальный редактор: страница показывается как на сайте (iframe без скриптов),
// редактируется только область контента. Картинки/файлы копятся и уходят в тот же коммит.
import { h, modal, toast, fileToBase64 } from './ui.mjs';
import * as C from './core.mjs';
import { uploadPath } from './ops.mjs';

const ALLOWED = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'UL', 'OL', 'LI', 'A', 'H2', 'H3', 'H4', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IMG', 'BLOCKQUOTE', 'HR', 'SUP', 'SUB']);
/** чистит вставленный из Word/сайтов HTML: оставляет только базовую разметку */
export function sanitizePaste(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node) => {
    for (const el of [...node.children]) {
      walk(el);
      let tag = el.tagName;
      if (tag === 'H1' || tag === 'H5' || tag === 'H6') { const n = doc.createElement('h3'); n.innerHTML = el.innerHTML; el.replaceWith(n); continue; }
      if (['SCRIPT', 'STYLE', 'META', 'LINK', 'XML'].includes(tag) || tag.includes(':')) { el.remove(); continue; }
      if (!ALLOWED.has(tag)) { el.replaceWith(...el.childNodes); continue; }
      for (const a of [...el.attributes]) {
        const keep = (tag === 'A' && a.name === 'href') || (tag === 'IMG' && (a.name === 'src' || a.name === 'alt')) || ((tag === 'TD' || tag === 'TH') && (a.name === 'colspan' || a.name === 'rowspan'));
        if (!keep) el.removeAttribute(a.name);
      }
      if (tag === 'A' && /^javascript:/i.test(el.getAttribute('href') || '')) el.removeAttribute('href');
    }
  };
  walk(doc.body);
  return doc.body.innerHTML.replace(/<p>\s*(&nbsp;)?\s*<\/p>/g, '');
}

export function createEditor({ srcHtml, dir, pages, media, onDirty = () => {} }) {
  const edit = C.getEditable(srcHtml);
  const root = h('div', { class: 'editor' });
  if (!edit) {
    root.append(h('div', { class: 'notice' }, 'Эта страница — автоматический список (обновляется сама при добавлении и удалении страниц). Изменить её можно только во вкладке «Весь файл (HTML)».'));
    return { el: root, supported: false, getInner: () => null, setInner() {}, pending: () => [] };
  }
  const pendingFiles = [];
  let mode = 'visual';

  // ---- iframe с предпросмотром
  const open = srcHtml.slice(edit.start, edit.openEnd).replace(/>$/, ' contenteditable="true" data-akvt-edit="1">');
  let docHtml = srcHtml.slice(0, edit.start) + open + srcHtml.slice(edit.openEnd);
  docHtml = docHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '').replace(/href=(["'])javascript:[^"']*\1/gi, 'href="#"');
  const css = `<style>[data-reveal],.reveal{opacity:1!important;transform:none!important}
    [data-akvt-edit]{outline:2px dashed #6f8cff;outline-offset:6px;min-height:120px;cursor:text}
    img{max-width:100%;height:auto} html{scroll-behavior:auto} .hp-top,.hp-header,.hp-mobile-nav{pointer-events:none}</style>`;
  docHtml = docHtml.replace(/<head[^>]*>/i, (m) => `${m}<base href="${location.origin}/${dir ? dir + '/' : ''}">`).replace(/<\/head>/i, css + '</head>');

  const frame = h('iframe', { class: 'ed-frame', sandbox: 'allow-same-origin', title: 'Редактор страницы' });
  let doc; let region; let lastRange = null;
  const ready = new Promise((resolve) => {
    frame.addEventListener('load', () => {
      doc = frame.contentDocument;
      region = doc.querySelector('[data-akvt-edit]');
      doc.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a'); if (a) e.preventDefault(); }, true);
      doc.addEventListener('submit', (e) => e.preventDefault(), true);
      region.addEventListener('input', onDirty);
      doc.addEventListener('selectionchange', () => {
        const s = doc.getSelection();
        if (s && s.rangeCount && region.contains(s.getRangeAt(0).commonAncestorContainer)) lastRange = s.getRangeAt(0).cloneRange();
      });
      region.addEventListener('paste', (e) => {
        const html = e.clipboardData && e.clipboardData.getData('text/html');
        if (html) { e.preventDefault(); doc.execCommand('insertHTML', false, sanitizePaste(html)); onDirty(); }
      });
      setTimeout(() => { try { frame.contentWindow.scrollTo(0, Math.max(0, region.getBoundingClientRect().top - 120)); } catch { /* ignore */ } }, 50);
      resolve();
    }, { once: true });
  });
  frame.srcdoc = docHtml;

  const exec = (cmd, arg) => { if (mode !== 'visual') return; restoreRange(lastRange); doc.execCommand(cmd, false, arg); onDirty(); };
  const saveRange = () => { const s = doc.getSelection(); return s && s.rangeCount && region.contains(s.getRangeAt(0).commonAncestorContainer) ? s.getRangeAt(0).cloneRange() : lastRange; };
  const restoreRange = (r) => { region.focus(); if (r) { const s = doc.getSelection(); s.removeAllRanges(); s.addRange(r); } };

  // ---- диалоги
  const pageOptions = () => pages().filter((p) => !p.n || true).slice().sort((a, b) => a.t.localeCompare(b.t, 'ru'))
    .map((p) => h('option', { value: C.pageHref(dir, p.d) }, `${p.t} — /${p.d}`));
  function linkDialog() {
    const range = saveRange();
    const url = h('input', { type: 'text', placeholder: 'https://… или выберите страницу ниже', class: 'wide' });
    const pick = h('select', { onchange: (e) => { if (e.target.value) url.value = e.target.value; } }, h('option', { value: '' }, '— страница сайта —'), pageOptions());
    const blank = h('input', { type: 'checkbox' });
    modal({ title: 'Ссылка', body: h('div', { class: 'form' }, h('label', {}, 'Адрес', url), h('label', {}, 'Или страница сайта', pick), h('label', { class: 'check' }, blank, ' Открывать в новой вкладке')),
      buttons: [{ text: 'Отмена' }, { text: 'Вставить', primary: true, onClick: () => {
        const u = url.value.trim(); if (!u) return false;
        restoreRange(range);
        if (range && range.collapsed) doc.execCommand('insertHTML', false, `<a href="${C.escapeAttr(u)}"${blank.checked ? ' target="_blank" rel="noopener"' : ''}>${C.escapeHtml(u)}</a>`);
        else {
          doc.execCommand('createLink', false, u);
          if (blank.checked) region.querySelectorAll('a').forEach((a) => { if (a.getAttribute('href') === u) { a.target = '_blank'; a.rel = 'noopener'; } });
        }
        onDirty();
      } }] });
  }
  function imageDialog() {
    const range = saveRange();
    const sel = h('select', {}, h('option', { value: '' }, '— выбрать из загруженных —'), media().map((m) => h('option', { value: m }, m.replace('wp-content/uploads/', ''))));
    const file = h('input', { type: 'file', accept: 'image/*' });
    const url = h('input', { type: 'text', class: 'wide', placeholder: 'или адрес картинки в интернете (https://…)' });
    const alt = h('input', { type: 'text', class: 'wide', placeholder: 'Описание картинки (для слабовидящих)' });
    const align = h('select', {}, h('option', { value: 'aligncenter' }, 'По центру'), h('option', { value: '' }, 'Без выравнивания'), h('option', { value: 'alignleft' }, 'Слева'), h('option', { value: 'alignright' }, 'Справа'));
    modal({ title: 'Картинка', body: h('div', { class: 'form' }, h('label', {}, 'Загрузить новую', file), h('label', {}, 'Загруженные ранее', sel), h('label', {}, 'Ссылка', url), h('label', {}, 'Описание', alt), h('label', {}, 'Выравнивание', align)),
      buttons: [{ text: 'Отмена' }, { text: 'Вставить', primary: true, onClick: async () => {
        let src; let extra = '';
        if (file.files[0]) {
          const f = file.files[0];
          if (f.size > 8e6) { toast('Картинка больше 8 МБ — уменьшите её перед загрузкой', 'err'); return false; }
          const rootPath = uploadPath(f.name);
          pendingFiles.push({ rootPath, base64: await fileToBase64(f) });
          src = URL.createObjectURL(f); extra = ` data-akvt-path="${C.relFromDir(dir, rootPath)}"`;
        } else if (sel.value) src = C.relFromDir(dir, sel.value);
        else if (url.value.trim()) src = url.value.trim();
        else return false;
        restoreRange(range);
        const cls = align.value ? ` class="${align.value}"` : '';
        doc.execCommand('insertHTML', false, `<img src="${C.escapeAttr(src)}" alt="${C.escapeAttr(alt.value)}"${cls}${extra}>`);
        onDirty();
      } }] });
  }
  function fileDialog() {
    const range = saveRange();
    const file = h('input', { type: 'file' });
    const text = h('input', { type: 'text', class: 'wide', placeholder: 'Текст ссылки (по умолчанию — имя файла)' });
    modal({ title: 'Файл (PDF, документ…)', body: h('div', { class: 'form' }, h('label', {}, 'Файл', file), h('label', {}, 'Текст ссылки', text)),
      buttons: [{ text: 'Отмена' }, { text: 'Вставить', primary: true, onClick: async () => {
        const f = file.files[0]; if (!f) return false;
        if (f.size > 25e6) { toast('Файл больше 25 МБ — GitHub его не примет', 'err'); return false; }
        const rootPath = uploadPath(f.name);
        pendingFiles.push({ rootPath, base64: await fileToBase64(f) });
        const href = C.relFromDir(dir, rootPath);
        const hasSel = range && !range.collapsed;
        restoreRange(range);
        if (hasSel) doc.execCommand('createLink', false, href);
        else doc.execCommand('insertHTML', false, `<a href="${href}">${C.escapeHtml(text.value.trim() || f.name)}</a>`);
        onDirty();
      } }] });
  }
  function tableDialog() {
    const range = saveRange();
    const rows = h('input', { type: 'number', value: 3, min: 1, max: 40 });
    const cols = h('input', { type: 'number', value: 3, min: 1, max: 12 });
    modal({ title: 'Таблица', body: h('div', { class: 'form' }, h('label', {}, 'Строк', rows), h('label', {}, 'Столбцов', cols)),
      buttons: [{ text: 'Отмена' }, { text: 'Вставить', primary: true, onClick: () => {
        const r = Math.min(40, +rows.value || 1); const c = Math.min(12, +cols.value || 1);
        const row = (tag) => `<tr>${Array.from({ length: c }, () => `<${tag}>&nbsp;</${tag}>`).join('')}</tr>`;
        restoreRange(range);
        doc.execCommand('insertHTML', false, `<table><tbody>${row('th')}${Array.from({ length: r - 1 }, () => row('td')).join('')}</tbody></table><p></p>`);
        onDirty();
      } }] });
  }

  // ---- панель инструментов
  const btn = (label, title, fn, cls = '') => h('button', { type: 'button', class: `tb ${cls}`, title, onmousedown: (e) => e.preventDefault(), onclick: fn }, label);
  const block = h('select', { class: 'tb-select', title: 'Стиль абзаца', onchange: (e) => { exec('formatBlock', e.target.value); e.target.value = ''; } },
    h('option', { value: '' }, 'Стиль…'), h('option', { value: 'P' }, 'Обычный текст'), h('option', { value: 'H2' }, 'Заголовок 2'), h('option', { value: 'H3' }, 'Заголовок 3'), h('option', { value: 'H4' }, 'Заголовок 4'), h('option', { value: 'BLOCKQUOTE' }, 'Цитата'));
  const toolbar = h('div', { class: 'toolbar' }, block,
    btn('Ж', 'Жирный', () => exec('bold'), 'b'), btn('К', 'Курсив', () => exec('italic'), 'i'), btn('Ч', 'Подчёркнутый', () => exec('underline'), 'u'),
    btn('• Список', 'Маркированный список', () => exec('insertUnorderedList')), btn('1. Список', 'Нумерованный список', () => exec('insertOrderedList')),
    btn([ico('links', 13), ' Ссылка'], 'Ссылка', linkDialog), btn('Без ссылки', 'Убрать ссылку', () => exec('unlink')),
    btn([ico('files', 13), ' Картинка'], 'Картинка', imageDialog), btn([ico('paperclip', 13), ' Файл'], 'Файл / документ', fileDialog), btn([ico('table', 13), ' Таблица'], 'Таблица', tableDialog),
    btn([ico('line', 13), ' Линия'], 'Горизонтальная линия', () => exec('insertHorizontalRule')), btn([ico('clear', 13), ' Очистить'], 'Убрать оформление', () => exec('removeFormat')),
    btn('↶', 'Отменить', () => exec('undo')), btn('↷', 'Повторить', () => exec('redo')));

  // ---- вкладки визуально / код
  const code = h('textarea', { class: 'ed-code', spellcheck: 'false', oninput: onDirty });
  const tabs = h('div', { class: 'subtabs' });
  const tV = h('button', { type: 'button', class: 'active', onclick: () => setMode('visual') }, 'Визуально');
  const tC = h('button', { type: 'button', onclick: () => setMode('code') }, 'HTML-код');
  tabs.append(tV, tC);
  const visualInner = () => {
    if (!region) return (edit && edit.inner) || '';
    const clone = region.cloneNode(true);
    clone.querySelectorAll('img[data-akvt-path]').forEach((img) => { img.setAttribute('src', img.dataset.akvtPath); img.removeAttribute('data-akvt-path'); });
    clone.removeAttribute('contenteditable'); clone.removeAttribute('data-akvt-edit');
    return clone.innerHTML;
  };
  function setMode(m) {
    if (m === mode) return;
    if (m === 'code') { code.value = visualInner(); frame.style.display = 'none'; toolbar.classList.add('off'); code.style.display = 'block'; }
    else { region.innerHTML = code.value; frame.style.display = 'block'; toolbar.classList.remove('off'); code.style.display = 'none'; }
    mode = m; tV.classList.toggle('active', m === 'visual'); tC.classList.toggle('active', m === 'code');
  }
  code.style.display = 'none';
  root.append(tabs, toolbar, frame, code);

  return {
    el: root, supported: true,
    ready,
    getInner() { return mode === 'code' ? code.value : visualInner(); },
    async setInner(html) { await ready; region.innerHTML = html; if (mode === 'code') code.value = html; },
    /** файлы, которые реально используются в тексте */
    pending() {
      const inner = this.getInner();
      return pendingFiles.filter((f) => inner.includes(f.rootPath.split('/').slice(-1)[0]));
    },
  };
}
