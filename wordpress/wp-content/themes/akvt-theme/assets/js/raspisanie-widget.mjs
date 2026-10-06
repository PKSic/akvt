/* Schedule Widget — self-contained, no Tailwind
   Context: students | teachers (from page URL)
   Modes: agasu | spo
   API: raspisanie.xn--80aai1dk.xn--p1ai
*/
(function(){
  "use strict";

  const BASE = "https://raspisanie.xn--80aai1dk.xn--p1ai/api";
  const HEADERS = { "Accept":"application/json","X-Requested-With":"XMLHttpRequest" };
  const BELLS_URL = "https://raspisanie.xn--80aai1dk.xn--p1ai/bells";

  /* --- Context detection --- */
  const IS_STUDENTS = location.pathname.includes("/students/");
  const IS_TEACHERS = location.pathname.includes("/teachers/");
  const CONTEXT = IS_STUDENTS ? "students" : IS_TEACHERS;

  /* --- Utility helpers (match reference) --- */
  const f = (e) => CONTEXT === "teachers" ? e.group_name : (e.signature || "");
  const p = (e) => [e.subject, e.prim].filter(Boolean).join(" ");
  const m = (e) => [e.classroom, e.classroom_building].filter(Boolean).join(" · ");
  const g = (e) => (e.signature || "").trim().slice(0, 5);
  const _ = (e) => { const s = e.start_time, nd = e.end_time; return (s && nd) ? `${s}\u2013${nd}` : (e.pair || ""); };
  const esc = (s) => { const d = document.createElement("span"); d.textContent = s; return d.innerHTML; };

  /* --- Week helpers --- */
  const MS_PER_DAY = 86400000;
  function getISOWeek(d) {
    const t = new Date(d.getTime() + 4 * (d.getTimezoneOffset() || 0) * 60000);
    const dayNum = t.getDay() || 7;
    t.setDate(t.getDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(t.getFullYear(), 0, 1));
    const weekNo = Math.ceil(((t - yearStart) / MS_PER_DAY + 1) / 7);
    return { year: t.getFullYear(), week: weekNo };
  }
  function mondayOfCurrentISOWeek() {
    const now = new Date();
    const day = now.getDay() || 7;
    const diff = now.getDate() - day + 1;
    const mon = new Date(now);
    mon.setDate(diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  }
  function sundayOfCurrentISOWeek() {
    const mon = mondayOfCurrentISOWeek();
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    return sun;
  }
  function isoDate(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }
  const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const WEEKDAYS_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

  /* --- Scoped CSS --- */
  const CSS = `
    .rw-wrap{font-family:inherit;margin:1rem 0}
    .rw-bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem}
    .rw-bar label{font-weight:600;font-size:.9rem}
    .rw-bar select,.rw-bar input[type=date]{padding:.35rem .5rem;border:1px solid #ccc;border-radius:4px;font-size:.9rem;background:#fff}
    .rw-bar select{min-width:140px;max-width:260px}
    .rw-bar input[type=date]{width:150px}
    .rw-bar button{padding:.35rem .75rem;border:1px solid #23527c;background:#23527c;color:#fff;border-radius:4px;cursor:pointer;font-size:.9rem}
    .rw-bar button:hover{background:#1a3d5c}
    .rw-bar .rw-nav{display:flex;gap:.25rem;margin-left:auto}
    .rw-bar .rw-nav button{background:#f0f0f0;color:#333;border-color:#ccc}
    .rw-bar .rw-nav button:hover{background:#ddd}
    .rw-date-range{display:flex;align-items:center;gap:.35rem;font-size:.9rem;color:#555}
    .rw-date-range span{padding:0 .25rem}
    .rw-mode{display:flex;gap:.25rem}
    .rw-mode button{padding:.3rem .6rem;border:1px solid #ccc;border-radius:4px;background:#fafafa;cursor:pointer;font-size:.8rem}
    .rw-mode button.active{background:#23527c;color:#fff;border-color:#23527c}
    .rw-loading{text-align:center;padding:2rem;color:#666}
    .rw-empty{text-align:center;padding:2rem;color:#999;font-style:italic}
    .rw-error{text-align:center;padding:1rem;color:#c33;background:#fff0f0;border:1px solid #fcc;border-radius:4px}
    .rw-table-wrap{overflow-x:auto}
    .rw-table{width:100%;border-collapse:collapse;font-size:.88rem}
    .rw-table th{background:#23527c;color:#fff;padding:.5rem .6rem;text-align:left;white-space:nowrap}
    .rw-table td{padding:.45rem .6rem;border-bottom:1px solid #e0e0e0;vertical-align:top}
    .rw-table tr:hover td{background:#f5f9fc}
    .rw-table .rw-date-row td{background:#eef3f8;font-weight:700;font-size:.92rem;padding:.6rem;border-bottom:2px solid #23527c}
    .rw-table .rw-pair{font-weight:700;white-space:nowrap;width:50px}
    .rw-table .rw-pair-num{font-size:1.1rem;color:#23527c}
    .rw-table .rw-pair-time{font-size:.75rem;color:#888;display:block}
    .rw-table .rw-prim{color:#888;font-size:.8rem}
    .rw-table .rw-bells{display:inline-block;margin-left:.5rem;color:#23527c;text-decoration:none;font-size:.8rem;border-bottom:1px dashed #23527c}
    .rw-table .rw-bells:hover{color:#1a3d5c}
    .rw-card{border:1px solid #e0e0e0;border-radius:6px;padding:.75rem;margin-bottom:.75rem;background:#fff}
    .rw-card .rw-card-pair{font-size:1.1rem;font-weight:700;color:#23527c;margin-bottom:.25rem}
    .rw-card .rw-card-subject{font-weight:600;margin-bottom:.25rem}
    .rw-card .rw-card-meta{font-size:.82rem;color:#666}
    .rw-card .rw-card-meta span{display:inline-block;margin-right:.75rem}
    .rw-card .rw-card-prim{font-size:.8rem;color:#888;font-style:italic;margin-top:.2rem}
    .rw-date-header{background:#23527c;color:#fff;padding:.5rem .75rem;border-radius:6px 6px 0 0;margin-top:1rem;font-weight:600;display:flex;justify-content:space-between;align-items:center}
    .rw-date-header:first-child{margin-top:0}
    .rw-date-header .rw-date-label{font-size:.95rem}
    .rw-date-header .rw-weekday-label{font-size:.8rem;opacity:.85}
    .rw-cards-group{margin-bottom:1rem}
    @media(max-width:700px){
      .rw-bar{flex-direction:column;align-items:stretch}
      .rw-bar .rw-nav{margin-left:0;justify-content:center}
      .rw-date-range{justify-content:center}
      .rw-table-wrap{display:none}
      .rw-cards{display:block!important}
    }
    @media(min-width:701px){
      .rw-cards{display:none!important}
    }
  `;

  /* --- Inject CSS once --- */
  function injectCSS() {
    if (document.getElementById("rw-css")) return;
    const s = document.createElement("style");
    s.id = "rw-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* --- API fetch helper --- */
  async function apiFetch(path, params = {}) {
    const url = new URL(path, BASE);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, v);
    });
    const resp = await fetch(url.toString(), { headers: HEADERS });
    if (!resp.ok) throw new Error(`API ${resp.status}: ${path}`);
    return resp.json();
  }

  /* --- Main widget class --- */
  class ScheduleWidget {
    constructor(container) {
      this.container = container;
      this.mode = "spo";          // "spo" | "agasu"
      this.subdivisions = [];
      this.subdivision = null;    // {id, title}
      this.items = [];            // groups or teachers [{id,title}]
      this.target = null;         // selected group/teacher title string
      this.schedule = [];
      this.loading = false;
      this.error = null;
      this.dateFrom = mondayOfCurrentISOWeek();
      this.dateTo = sundayOfCurrentISOWeek();

      this.render();
      this.loadSubdivisions();
    }

    /* --- Data loading --- */
    async loadSubdivisions() {
      this.subdivisions = [];
      this.subdivision = null;
      this.items = [];
      this.target = null;
      this.schedule = [];
      try {
        if (this.mode === "spo") {
          this.subdivisions = await apiFetch("/spo/institutions");
        } else {
          // agasu: single mode, no subdivision list
          this.subdivisions = [{ id: "agasu", title: "АГАСУ" }];
        }
        if (this.subdivisions.length === 1) {
          this.subdivision = this.subdivisions[0];
          await this.loadItems();
        }
        this.render();
      } catch (e) {
        this.error = e.message;
        this.render();
      }
    }

    async loadItems() {
      this.items = [];
      this.target = null;
      this.schedule = [];
      if (!this.subdivision) return;
      try {
        const endpoint = this.mode === "spo"
          ? (CONTEXT === "students" ? "/spo/groups" : "/spo/teachers")
          : (CONTEXT === "students" ? "/agasu/groups" : "/agasu/teachers");
        const params = {};
        if (this.mode === "spo") {
          params.subdivision_cod = this.subdivision.id;
        }
        this.items = await apiFetch(endpoint, params);
        this.render();
      } catch (e) {
        this.error = e.message;
        this.render();
      }
    }

    async loadSchedule() {
      if (!this.target) { this.schedule = []; this.render(); return; }
      this.loading = true;
      this.error = null;
      this.render();
      try {
        const endpoint = this.mode === "spo" ? "/spo/schedule" : "/agasu/schedule";
        const params = {
          range: 4,
          date_from: isoDate(this.dateFrom),
          date_to: isoDate(this.dateTo),
        };
        if (this.mode === "spo") {
          params.subdivision_cod = this.subdivision.id;
        }
        // Target param name: students → group, teachers → teacher (for spo)
        // agasu uses group_name/signature_name — we'll try both for robustness
        if (CONTEXT === "students") {
          params.group = this.target;
        } else {
          if (this.mode === "spo") {
            params.signature = this.target;
          } else {
            params.teacher = this.target;
          }
        }
        this.schedule = await apiFetch(endpoint, params);
        this.loading = false;
        this.render();
      } catch (e) {
        this.error = e.message;
        this.loading = false;
        this.render();
      }
    }

    /* --- Date navigation --- */
    prevWeek() {
      this.dateFrom = addDays(this.dateFrom, -7);
      this.dateTo = addDays(this.dateTo, -7);
      this.loadSchedule();
    }
    nextWeek() {
      this.dateFrom = addDays(this.dateFrom, 7);
      this.dateTo = addDays(this.dateTo, 7);
      this.loadSchedule();
    }
    today() {
      this.dateFrom = mondayOfCurrentISOWeek();
      this.dateTo = sundayOfCurrentISOWeek();
      this.loadSchedule();
    }

    /* --- Group schedule items by date --- */
    groupByDate(items) {
      const map = new Map();
      items.forEach(item => {
        const key = item.date || "unknown";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      });
      return map;
    }

    /* --- Build weekday from date string dd.mm.yy --- */
    weekdayFromDate(dateStr) {
      if (!dateStr) return "";
      const parts = dateStr.split(/[.\-\/]/);
      if (parts.length < 3) return "";
      const y = parseInt(parts[2]) < 100 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
      const d = new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]));
      return WEEKDAYS_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1] || "";
    }

    /* --- Render --- */
    render() {
      const w = this.container;
      let html = "";

      // Mode toggle
      html += `<div class="rw-mode">
        <button data-mode="spo" class="${this.mode === "spo" ? "active" : ""}">СПО</button>
        <button data-mode="agasu" class="${this.mode === "agasu" ? "active" : ""}">АГАСУ</button>
      </div>`;

      // Filter bar
      html += `<div class="rw-bar">`;

      // Subdivision selector (only for spo with >1)
      if (this.mode === "spo" && this.subdivisions.length > 1) {
        html += `<label>Подразделение:</label>
          <select data-action="subdivision">
            <option value="">— выбор —</option>
            ${this.subdivisions.map(s =>
              `<option value="${s.id}" ${this.subdivision && this.subdivision.id === s.id ? "selected" : ""}>${esc(s.title)}</option>`
            ).join("")}
          </select>`;
      }

      // Target selector (group or teacher)
      if (this.items.length > 0) {
        const label = CONTEXT === "students" ? "Группа" : "Преподаватель";
        html += `<label>${label}:</label>
          <select data-action="target">
            <option value="">— выбор —</option>
            ${this.items.map(item =>
              `<option value="${esc(item.title)}" ${this.target === item.title ? "selected" : ""}>${esc(item.title)}</option>`
            ).join("")}
          </select>`;
      }

      // Date range
      html += `<div class="rw-date-range">
        <input type="date" data-action="dateFrom" value="${isoDate(this.dateFrom)}">
        <span>\u2013</span>
        <input type="date" data-action="dateTo" value="${isoDate(this.dateTo)}">
      </div>`;

      html += `</div>`; // end .rw-bar

      // Navigation
      html += `<div class="rw-bar">
        <div class="rw-nav">
          <button data-action="prevWeek">\u25C0</button>
          <button data-action="today">Сегодня</button>
          <button data-action="nextWeek">\u25B6</button>
        </div>
      </div>`;

      // Bells link
      html += `<div style="margin-bottom:.75rem">
        <a class="rw-bells" href="${BELLS_URL}" target="_blank" rel="noopener">Источник: расписание звонков</a>
      </div>`;

      // Error
      if (this.error) {
        html += `<div class="rw-error">Ошибка: ${esc(this.error)}</div>`;
      }

      // Loading
      if (this.loading) {
        html += `<div class="rw-loading">Загрузка...</div>`;
      }

      // Schedule content
      if (!this.loading && this.schedule.length > 0) {
        const grouped = this.groupByDate(this.schedule);

        // Desktop table
        html += `<div class="rw-table-wrap"><table class="rw-table">
          <thead><tr>
            <th>Пара</th>
            ${CONTEXT === "students"
              ? `<th>Предмет</th><th>Группа</th><th>Преподаватель</th><th>Место</th>`
              : `<th>Предмет</th><th>Преподаватель</th><th>Группа</th><th>Место</th>`
            }
          </tr></thead>
          <tbody>`;

        grouped.forEach((items, dateStr) => {
          const wd = this.weekdayFromDate(dateStr);
          html += `<tr class="rw-date-row"><td colspan="5">
            <strong>${esc(dateStr)}</strong> ${esc(wd)}
          </td></tr>`;
          items.forEach(item => {
            if (CONTEXT === "students") {
              html += `<tr>
                <td class="rw-pair">
                  <span class="rw-pair-num">${esc(String(item.pair || ""))}</span>
                  <span class="rw-pair-time">${esc(_(item))}</span>
                </td>
                <td>${esc(p(item))}</td>
                <td>${esc(item.group_name || "")}</td>
                <td>${esc(f(item))}</td>
                <td>${esc(m(item))}</td>
              </tr>`;
            } else {
              html += `<tr>
                <td class="rw-pair">
                  <span class="rw-pair-num">${esc(String(item.pair || ""))}</span>
                  <span class="rw-pair-time">${esc(_(item))}</span>
                </td>
                <td>${esc(p(item))}</td>
                <td>${esc(f(item))}</td>
                <td>${esc(item.group_name || "")}</td>
                <td>${esc(m(item))}</td>
              </tr>`;
            }
          });
        });

        html += `</tbody></table></div>`;

        // Mobile cards
        html += `<div class="rw-cards">`;
        grouped.forEach((items, dateStr) => {
          const wd = this.weekdayFromDate(dateStr);
          html += `<div class="rw-cards-group">
            <div class="rw-date-header">
              <span class="rw-date-label">${esc(dateStr)}</span>
              <span class="rw-weekday-label">${esc(wd)}</span>
            </div>`;
          items.forEach(item => {
            html += `<div class="rw-card">
              <div class="rw-card-pair">${esc(String(item.pair || ""))} пара ${esc(_(item)) ? "\u2014 " + esc(_(item)) : ""}</div>
              <div class="rw-card-subject">${esc(p(item))}</div>
              <div class="rw-card-meta">
                ${CONTEXT === "students"
                  ? `<span>Группа: <b>${esc(item.group_name || "")}</b></span>
                     <span>Преподаватель: ${esc(f(item))}</span>`
                  : `<span>Преподаватель: <b>${esc(f(item))}</b></span>
                     <span>Группа: ${esc(item.group_name || "")}</span>`
                }
                <span>Место: ${esc(m(item))}</span>
              </div>
              ${item.prim ? `<div class="rw-card-prim">${esc(item.prim)}</div>` : ""}
            </div>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
      }

      // Empty state
      if (!this.loading && !this.error && this.schedule.length === 0 && this.target) {
        html += `<div class="rw-empty">Расписание не найдено</div>`;
      }

      w.innerHTML = html;
      this.bindEvents();
    }

    bindEvents() {
      const w = this.container;

      // Mode toggle
      w.querySelectorAll("[data-mode]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const newMode = btn.dataset.mode;
          if (newMode !== this.mode) {
            this.mode = newMode;
            this.loadSubdivisions();
          }
        });
      });

      // Subdivision select
      const subSel = w.querySelector('[data-action="subdivision"]');
      if (subSel) {
        subSel.addEventListener("change", async () => {
          const id = subSel.value;
          this.subdivision = this.subdivisions.find(s => String(s.id) === String(id)) || null;
          await this.loadItems();
        });
      }

      // Target select
      const tgtSel = w.querySelector('[data-action="target"]');
      if (tgtSel) {
        tgtSel.addEventListener("change", () => {
          this.target = tgtSel.value || null;
          this.loadSchedule();
        });
      }

      // Date inputs
      const dfInput = w.querySelector('[data-action="dateFrom"]');
      if (dfInput) {
        dfInput.addEventListener("change", () => {
          const v = dfInput.value;
          if (v) {
            this.dateFrom = new Date(v + "T00:00:00");
            this.loadSchedule();
          }
        });
      }
      const dtInput = w.querySelector('[data-action="dateTo"]');
      if (dtInput) {
        dtInput.addEventListener("change", () => {
          const v = dtInput.value;
          if (v) {
            this.dateTo = new Date(v + "T00:00:00");
            this.loadSchedule();
          }
        });
      }

      // Nav buttons
      const prev = w.querySelector('[data-action="prevWeek"]');
      if (prev) prev.addEventListener("click", (e) => { e.preventDefault(); this.prevWeek(); });
      const today = w.querySelector('[data-action="today"]');
      if (today) today.addEventListener("click", (e) => { e.preventDefault(); this.today(); });
      const next = w.querySelector('[data-action="nextWeek"]');
      if (next) next.addEventListener("click", (e) => { e.preventDefault(); this.nextWeek(); });
    }
  }

  /* --- Mount --- */
  function mount() {
    if (!IS_STUDENTS && !IS_TEACHERS) return;
    // Find the target div after entry-content in the article
    const entry = document.querySelector(".entry-content");
    if (!entry) return;
    // Create widget container
    const container = document.createElement("div");
    container.id = "raspisanie-widget";
    entry.parentNode.insertBefore(container, entry.nextSibling);
    injectCSS();
    new ScheduleWidget(container);
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

})();
