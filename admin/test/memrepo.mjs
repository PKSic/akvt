// Файловая «репа» для тестов: тот же интерфейс, что и у GitHubRepo, но пишет на диск.
import fs from 'fs'; import path from 'path';
export class MemRepo {
  constructor(root) { this.root = root; this.commits = []; }
  async read(p) { const f = path.join(this.root, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; }
  async commit(changes, message) {
    for (const c of changes) {
      const f = path.join(this.root, c.path);
      if (c.delete) { if (fs.existsSync(f)) fs.rmSync(f); continue; }
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, c.base64 != null ? Buffer.from(c.base64, 'base64') : c.content);
    }
    this.commits.push({ message, files: changes.length });
    return { sha: 'test' + this.commits.length };
  }
}
