// Мелкие помощники интерфейса.
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);

let toastTimer;
export function toast(msg, kind = 'ok', ms = 6000) {
  const box = document.getElementById('toast');
  box.className = `toast ${kind} show`;
  box.replaceChildren(typeof msg === 'string' ? document.createTextNode(msg) : msg);
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(() => box.classList.remove('show'), ms);
}

export function closeModal() { const r = document.getElementById('modal'); r.replaceChildren(); r.className = ''; }
export function modal({ title, body, buttons = [], wide = false }) {
  const root = document.getElementById('modal');
  const close = closeModal;
  const bar = h('div', { class: 'modal-actions' }, buttons.map((b) =>
    h('button', { class: b.primary ? 'btn primary' : 'btn', type: 'button', onclick: async () => { const r = b.onClick ? await b.onClick(close) : undefined; if (r !== false && !b.keep) close(); } }, b.text)));
  root.className = 'open';
  root.replaceChildren(h('div', { class: 'modal-back', onclick: (e) => { if (e.target === e.currentTarget) close(); } },
    h('div', { class: `modal-box${wide ? ' wide' : ''}` }, h('h3', {}, title), h('div', { class: 'modal-body' }, body), bar)));
  return close;
}
export const confirmDlg = (text, okText = 'Да') => new Promise((res) => {
  modal({ title: 'Подтвердите', body: h('p', {}, text), buttons: [
    { text: 'Отмена', onClick: () => res(false) },
    { text: okText, primary: true, onClick: () => res(true) },
  ] });
});

export const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(',')[1]);
  r.onerror = () => rej(r.error);
  r.readAsDataURL(file);
});
export const fmtSize = (n) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' МБ' : Math.max(1, Math.round(n / 1024)) + ' КБ');
export const fmtDate = (iso) => new Date(iso).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
export const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
