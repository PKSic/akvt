// Клиент GitHub REST API. Запись — одним коммитом через Git Data API (tree + commit + ref).
const API = globalThis.AKVT_GITHUB_API || 'https://api.github.com';
const encPath = (p) => p.split('/').map(encodeURIComponent).join('/');

export class GitHubRepo {
  constructor({ token, owner, repo, branch }) {
    Object.assign(this, { token, owner, repo, branch });
    this.cache = new Map();
  }
  get base() { return `${API}/repos/${this.owner}/${this.repo}`; }
  headers(extra = {}) {
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...extra };
  }
  async api(path, { method = 'GET', body, raw = false, allow404 = false } = {}) {
    const url = path.startsWith('http') ? path : this.base + path;
    const res = await fetch(url, {
      method,
      headers: this.headers(raw ? { Accept: 'application/vnd.github.raw+json' } : {}),
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (res.status === 404 && allow404) return null;
    if (!res.ok) {
      let msg = res.statusText;
      try { msg = (await res.json()).message || msg; } catch { /* ignore */ }
      const e = new Error(explain(res.status, msg));
      e.status = res.status;
      throw e;
    }
    return raw ? res.text() : res.status === 204 ? null : res.json();
  }
  async whoami() { return this.api(`${API}/user`); }
  async check() {
    const r = await this.api('');
    const br = await this.api(`/branches/${encodeURIComponent(this.branch)}`);
    // fine-grained токены не всегда отдают permissions — блокируем вход только если право записи явно отсутствует
    return { repo: r, canPush: !(r.permissions && r.permissions.push === false), branch: br };
  }
  async read(path) {
    const t = await this.api(`/contents/${encPath(path)}?ref=${encodeURIComponent(this.branch)}`, { raw: true, allow404: true });
    return t;
  }
  async readAt(path, ref) {
    return this.api(`/contents/${encPath(path)}?ref=${encodeURIComponent(ref)}`, { raw: true, allow404: true });
  }
  async tree() {
    const t = await this.api(`/git/trees/${encodeURIComponent(this.branch)}?recursive=1`);
    return t.tree.filter((x) => x.type === 'blob').map((x) => ({ path: x.path, size: x.size }));
  }
  async history(path, n = 20) {
    const q = path ? `&path=${encodeURIComponent(path)}` : '';
    const list = await this.api(`/commits?sha=${encodeURIComponent(this.branch)}&per_page=${n}${q}`);
    return list.map((c) => ({ sha: c.sha, message: c.commit.message.split('\n')[0], date: c.commit.author.date, author: c.commit.author.name, url: c.html_url }));
  }
  /** changes: [{path, content} | {path, base64} | {path, delete:true}] */
  async commit(changes, message) {
    if (!changes.length) return null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const ref = await this.api(`/git/ref/heads/${encodeURIComponent(this.branch)}`);
      const parentSha = ref.object.sha;
      const parent = await this.api(`/git/commits/${parentSha}`);
      const entries = [];
      for (const c of changes) {
        if (c.delete) entries.push({ path: c.path, mode: '100644', type: 'blob', sha: null });
        else if (c.base64 != null) {
          const blob = await this.api('/git/blobs', { method: 'POST', body: { content: c.base64, encoding: 'base64' } });
          entries.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
        } else entries.push({ path: c.path, mode: '100644', type: 'blob', content: c.content });
      }
      // дробим на запросы по ~1.5 МБ
      let baseTree = parent.tree.sha;
      let chunk = [];
      let size = 0;
      const flush = async () => {
        if (!chunk.length) return;
        const t = await this.api('/git/trees', { method: 'POST', body: { base_tree: baseTree, tree: chunk } });
        baseTree = t.sha; chunk = []; size = 0;
      };
      for (const e of entries) {
        const s = e.content ? e.content.length : 200;
        if (size + s > 1_500_000 || chunk.length >= 40) await flush();
        chunk.push(e); size += s;
      }
      await flush();
      const commit = await this.api('/git/commits', { method: 'POST', body: { message, tree: baseTree, parents: [parentSha] } });
      try {
        await this.api(`/git/refs/heads/${encodeURIComponent(this.branch)}`, { method: 'PATCH', body: { sha: commit.sha, force: false } });
        return commit;
      } catch (e) {
        if (e.status === 422 && attempt < 2) continue; // ветка ушла вперёд — повторяем на свежей базе
        throw e;
      }
    }
    return null;
  }
}

function explain(status, msg) {
  if (status === 401) return 'GitHub не принял токен (401). Проверьте токен или создайте новый.';
  if (status === 403) return `GitHub отказал (403): ${msg}. Если это лимит запросов — подождите несколько минут.`;
  if (status === 404) return 'Не найдено (404). Проверьте имя репозитория, ветку и права токена.';
  if (status === 409 || status === 422) return `Конфликт при записи: ${msg}. Обновите страницу админки и повторите.`;
  return `${status}: ${msg}`;
}
