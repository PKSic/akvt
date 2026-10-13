/**
 * АКВТ — режим «Версия для слабовидящих»
 *
 * Подключается в <head> каждой страницы (без defer): классы режима ставятся на
 * <html> до первой отрисовки, поэтому страница не «мигает» обычным видом.
 * Интерфейс (панель настроек, кнопка, полоса состояния) создаётся скриптом сам —
 * в HTML страниц никакой разметки режима нет.
 *
 * Что умеет режим:
 *   • размер шрифта 100–200 % (масштаб через rem, раскладка перестраивается
 *     как при увеличении масштаба в браузере — см. css/vision-layout.css);
 *   • 5 цветовых схем с контрастом не ниже 7:1;
 *   • изображения: показывать / чёрно-белые / скрыть (вместо них — их alt-текст);
 *   • шрифт с засечками / без засечек, межбуквенный и межстрочный интервал;
 *   • озвучивание страницы или выделенного текста (Web Speech API);
 *   • настройки сохраняются (localStorage) и действуют на всех страницах сайта
 *     и во всех открытых вкладках.
 *
 * Разметка/стили: css/vision.css (+ автогенерируемый css/vision-layout.css).
 */
(function () {
  "use strict";

  var KEY = "akvt_bvi_v3";
  var OLD_KEY = "akvt_bvi_v2";

  var SCALES = [100, 125, 150, 175, 200];
  var THEMES = [
    { id: "bw", name: "Чёрный на белом" },
    { id: "wb", name: "Белый на чёрном" },
    { id: "blue", name: "Тёмно-синий на голубом" },
    { id: "beige", name: "Коричневый на бежевом" },
    { id: "green", name: "Зелёный на коричневом" }
  ];
  // Те же значения, что в @media (max-width) сайта: см. tools/build-vision-layout.py
  var BREAKPOINTS = [374, 480, 520, 600, 767, 768, 900, 1023, 1120];

  var DEFAULTS = {
    on: false,
    scale: 150,
    theme: "bw",
    images: "show", // show | gray | hide
    ls: 0, // межбуквенный интервал: 0 | 1 | 2
    lh: 0, // межстрочный интервал: 0 | 1 | 2
    font: "sans" // sans | serif
  };
  // Что включается, когда человек впервые нажал «Версия для слабовидящих»
  var FIRST_ON = { on: true, scale: 150, theme: "bw" };

  var html = document.documentElement;
  var state = read();
  var ui = {}; // ссылки на элементы интерфейса
  var lastOpener = null;

  /* ------------------------------------------------------------ состояние */
  function extend(a, b) {
    for (var k in b) {
      if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k];
    }
    return a;
  }

  function sanitize(s) {
    var o = extend({}, DEFAULTS);
    if (s && typeof s === "object") extend(o, s);
    o.on = !!o.on;
    o.scale = parseInt(o.scale, 10);
    if (SCALES.indexOf(o.scale) < 0) o.scale = DEFAULTS.scale;
    if (!THEMES.some(function (t) { return t.id === o.theme; })) o.theme = DEFAULTS.theme;
    if (["show", "gray", "hide"].indexOf(o.images) < 0) o.images = "show";
    o.ls = [0, 1, 2].indexOf(+o.ls) < 0 ? 0 : +o.ls;
    o.lh = [0, 1, 2].indexOf(+o.lh) < 0 ? 0 : +o.lh;
    if (["sans", "serif"].indexOf(o.font) < 0) o.font = "sans";
    return o;
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return sanitize(JSON.parse(raw));
      // миграция со старой версии режима
      var old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
      if (old && typeof old === "object") {
        var themeMap = { bw: "bw", wb: "wb", blue: "blue", beige: "beige" };
        return sanitize({
          on: !!old.on,
          scale: old.font === 200 ? 200 : old.font === 150 ? 150 : old.font === 125 ? 125 : 100,
          theme: themeMap[old.theme] || "bw",
          images: old.images === false ? "hide" : "show",
          ls: old.spacing === "wide" ? 1 : 0,
          lh: old.spacing === "wide" ? 1 : 0
        });
      }
    } catch (e) {}
    return sanitize(null);
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function setState(patch, silent) {
    extend(state, patch);
    state = sanitize(state);
    write();
    apply();
    if (!silent) announce(describe(patch));
  }

  /* ------------------------------------------------------------ применение к странице */
  var CLASS_RE = /(^|\s)(bvi|bvi-(theme|img|ls|lh|ff|mw)-[\w-]+)(?=\s|$)/g;

  function effectiveWidth() {
    var w = window.innerWidth || html.clientWidth || 1280;
    return w / (state.on ? state.scale / 100 : 1);
  }

  function apply() {
    var cls = html.className.replace(CLASS_RE, " ").replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
    if (state.on) {
      var add = ["bvi", "bvi-theme-" + state.theme];
      if (state.images !== "show") add.push("bvi-img-" + state.images);
      if (state.ls) add.push("bvi-ls-" + state.ls);
      if (state.lh) add.push("bvi-lh-" + state.lh);
      if (state.font === "serif") add.push("bvi-ff-serif");
      var w = effectiveWidth();
      for (var i = 0; i < BREAKPOINTS.length; i++) {
        if (w <= BREAKPOINTS[i]) add.push("bvi-mw-" + BREAKPOINTS[i]);
      }
      cls = (cls ? cls + " " : "") + add.join(" ");
      html.setAttribute("data-bvi", "on");
      html.style.setProperty("--bvi-scale", String(state.scale / 100));
    } else {
      html.removeAttribute("data-bvi");
      html.style.removeProperty("--bvi-scale");
    }
    html.className = cls;
    syncUi();
    if (document.body) afterDom();
  }

  /* Работа с DOM, которая нужна только когда режим включён */
  var domTimer = 0;
  function afterDom() {
    if (!state.on) {
      removeAlts();
      clearMinFont();
      return;
    }
    if (state.images === "hide") addAlts();
    else removeAlts();
    wrapTables();
    enforceMinFont();
  }

  /* Мелкий текст дизайна (0.68rem, 11px и т. п.) нельзя «починить» одним правилом:
     размеры заданы десятками разных селекторов. Поэтому находим весь видимый текст
     мельче базового размера и помечаем его классом bvi-fs-min (css/vision.css → 1rem). */
  var MARK = "bvi-fs-min";
  function clearMinFont() {
    var old = document.getElementsByClassName(MARK);
    while (old.length) old[0].classList.remove(MARK);
  }

  function enforceMinFont() {
    clearMinFont();
    if (!document.body) return;
    var root = parseFloat(window.getComputedStyle(html).fontSize) || 16;
    var min = root - 0.5;
    var toMark = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var seen = [];
    var n;
    while ((n = walker.nextNode())) {
      if (!/\S/.test(n.nodeValue)) continue;
      var e = n.parentElement;
      if (!e || seen.indexOf(e) >= 0) continue;
      seen.push(e);
      var tag = e.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;
      if (closest(e, ".bvi-ui")) continue;
      if (parseFloat(window.getComputedStyle(e).fontSize) < min) toMark.push(e);
    }
    for (var i = 0; i < toMark.length; i++) toMark[i].classList.add(MARK);
  }

  function scheduleDom() {
    if (!state.on) return;
    clearTimeout(domTimer);
    domTimer = setTimeout(afterDom, 150);
  }

  function addAlts() {
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (closest(img, ".bvi-ui")) continue;
      if (/(^|\s)(emoji|wp-smiley)(\s|$)/.test(img.className)) continue;
      var prev = img.previousElementSibling;
      if (prev && prev.className === "bvi-alt") continue;
      var text = (img.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
      if (!text) text = (img.getAttribute("title") || "").trim();
      if (!text && closest(img, "a")) text = "Изображение";
      if (!text) continue;
      var span = document.createElement("span");
      span.className = "bvi-alt";
      span.textContent = "[" + text + "]";
      img.parentNode.insertBefore(span, img);
    }
  }

  function removeAlts() {
    var list = document.querySelectorAll(".bvi-alt");
    for (var i = 0; i < list.length; i++) list[i].parentNode.removeChild(list[i]);
  }

  function wrapTables() {
    var tables = document.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      if (closest(t, ".bvi-ui")) continue;
      var p = t.parentNode;
      if (!p || (p.className && String(p.className).indexOf("bvi-table-scroll") >= 0)) continue;
      var w = document.createElement("div");
      w.className = "bvi-table-scroll";
      p.insertBefore(w, t);
      w.appendChild(t);
    }
    // Прокручиваемой области нужен фокус с клавиатуры — только если таблица действительно шире
    var wr = document.querySelectorAll(".bvi-table-scroll");
    for (var j = 0; j < wr.length; j++) {
      var over = wr[j].scrollWidth > wr[j].clientWidth + 2;
      if (over) {
        wr[j].setAttribute("tabindex", "0");
        wr[j].setAttribute("role", "region");
        wr[j].setAttribute("aria-label", "Таблица. Прокручивается по горизонтали");
      } else {
        wr[j].removeAttribute("tabindex");
        wr[j].removeAttribute("role");
        wr[j].removeAttribute("aria-label");
      }
    }
  }

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      var m = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
      if (m && m.call(el, sel)) return el;
      el = el.parentNode;
    }
    return null;
  }

  /* ------------------------------------------------------------ интерфейс */
  var EYE =
    '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z"/>' +
    '<circle cx="12" cy="12" r="3.5"/></svg>';

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === "text") n.textContent = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i++) if (children[i]) n.appendChild(children[i]);
    }
    return n;
  }

  function optBtn(group, value, label, extraClass) {
    return el("button", {
      type: "button",
      class: "bvi-btn" + (extraClass ? " " + extraClass : ""),
      "data-bvi-set": group,
      "data-value": String(value),
      "aria-pressed": "false",
      text: label
    });
  }

  function group(title, controls, hint) {
    var fs = el("fieldset", { class: "bvi-group" }, [
      el("legend", { text: title }),
      el("div", { class: "bvi-row" }, controls)
    ]);
    if (hint) fs.appendChild(el("p", { class: "bvi-hint", text: hint }));
    return fs;
  }

  function buildUi() {
    var body = document.body;

    // 1. Ссылка для клавиатуры и экранных дикторов — самая первая на странице
    var skip = el("a", { class: "skip-link bvi-ui", href: "#bvi-settings", "data-bvi-open": "1", text: "Версия для слабовидящих" });
    var firstSkip = body.querySelector("a.skip-link");
    if (firstSkip && firstSkip.parentNode) firstSkip.parentNode.insertBefore(skip, firstSkip.nextSibling);
    else body.insertBefore(skip, body.firstChild);

    // 2. Полоса состояния (видна только в режиме)
    var bar = el("div", { class: "bvi-ui bvi-bar", role: "region", "aria-label": "Версия для слабовидящих" }, [
      el("div", { class: "bvi-bar-inner" }, [
        el("span", { class: "bvi-bar-title", text: "Включена версия для слабовидящих" }),
        el("button", { type: "button", class: "bvi-btn", "data-bvi-open": "1", text: "Настройки" }),
        el("button", { type: "button", class: "bvi-btn", "data-bvi-off": "1", text: "Обычная версия сайта" })
      ])
    ]);
    skip.parentNode.insertBefore(bar, skip.nextSibling);
    ui.bar = bar;

    // 3. Плавающая кнопка
    var fab = el("button", {
      type: "button",
      class: "bvi-ui bvi-fab",
      "data-bvi-open": "1",
      title: "Версия для слабовидящих",
      "aria-label": "Версия для слабовидящих: открыть настройки",
      "aria-haspopup": "dialog",
      html: EYE
    });
    body.appendChild(fab);
    ui.fab = fab;

    // 4. Ссылка в подвале — текстом, чтобы режим было легко найти
    var links = document.querySelector(".footer-links");
    if (links) {
      var fl = el("a", { href: "#bvi-settings", "data-bvi-open": "1", text: "Версия для слабовидящих" });
      links.appendChild(fl);
    }

    // 5. Диалог настроек
    var sizeOut = el("span", { class: "bvi-size-out", "aria-hidden": "true", text: "150%" });
    var sizeBtns = [
      el("button", { type: "button", class: "bvi-btn", "data-bvi-size": "-1", "aria-label": "Уменьшить шрифт", text: "A−" }),
      sizeOut,
      el("button", { type: "button", class: "bvi-btn", "data-bvi-size": "1", "aria-label": "Увеличить шрифт", text: "A+" })
    ];
    SCALES.forEach(function (s) {
      sizeBtns.push(optBtn("scale", s, s + "%"));
    });
    ui.sizeOut = sizeOut;

    var themeBtns = THEMES.map(function (t) {
      return el(
        "button",
        {
          type: "button",
          class: "bvi-sw bvi-sw-" + t.id,
          "data-bvi-set": "theme",
          "data-value": t.id,
          "aria-pressed": "false"
        },
        [el("span", { class: "bvi-aa", "aria-hidden": "true", text: "Аа" }), el("span", { class: "bvi-nm", text: t.name })]
      );
    });

    var speak = el("button", { type: "button", class: "bvi-btn", "data-bvi-speak": "1", text: "Прочитать вслух" });
    var speechGroup = null;
    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      speechGroup = group(
        "Озвучивание",
        [speak],
        "Читает выделенный текст, а если ничего не выделено — основное содержимое страницы."
      );
      ui.speak = speak;
    }

    var dialog = el("div", { class: "bvi-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "bvi-title", tabindex: "-1", id: "bvi-settings" }, [
      el("div", { class: "bvi-head" }, [
        el("h2", { id: "bvi-title", text: "Версия для слабовидящих" }),
        el("button", { type: "button", class: "bvi-btn", "data-bvi-close": "1", "aria-label": "Закрыть настройки", text: "✕" })
      ]),
      el("div", { class: "bvi-body" }, [
        group("Размер шрифта", sizeBtns),
        group("Цветовая схема", themeBtns),
        group("Изображения", [
          optBtn("images", "show", "Показывать"),
          optBtn("images", "gray", "Чёрно-белые"),
          optBtn("images", "hide", "Скрыть")
        ], "Если изображения скрыты, вместо них показывается их описание."),
        group("Шрифт", [optBtn("font", "sans", "Без засечек"), optBtn("font", "serif", "С засечками")]),
        group("Межбуквенный интервал", [optBtn("ls", 0, "Обычный"), optBtn("ls", 1, "Увеличенный"), optBtn("ls", 2, "Большой")]),
        group("Межстрочный интервал", [optBtn("lh", 0, "Обычный"), optBtn("lh", 1, "Увеличенный"), optBtn("lh", 2, "Большой")]),
        speechGroup
      ]),
      el("div", { class: "bvi-foot" }, [
        el("button", { type: "button", class: "bvi-btn bvi-danger", "data-bvi-reset": "1", text: "Сбросить настройки" }),
        el("button", { type: "button", class: "bvi-btn", "data-bvi-off": "1", text: "Обычная версия сайта" }),
        el("button", { type: "button", class: "bvi-btn", "data-bvi-close": "1", text: "Готово" })
      ])
    ]);

    var live = el("div", { class: "bvi-live", role: "status", "aria-live": "polite" });
    ui.live = live;
    var overlay = el("div", { class: "bvi-ui bvi-overlay", hidden: "hidden" }, [dialog, live]);
    body.appendChild(overlay);
    ui.overlay = overlay;
    ui.dialog = dialog;
  }

  function syncUi() {
    if (!ui.overlay) return;
    var btns = ui.overlay.querySelectorAll("[data-bvi-set]");
    for (var i = 0; i < btns.length; i++) {
      var g = btns[i].getAttribute("data-bvi-set");
      var v = btns[i].getAttribute("data-value");
      btns[i].setAttribute("aria-pressed", String(state[g]) === v ? "true" : "false");
    }
    if (ui.sizeOut) ui.sizeOut.textContent = state.scale + "%";
  }

  var liveTimer = 0;
  function announce(text) {
    if (!ui.live || !text) return;
    clearTimeout(liveTimer);
    ui.live.textContent = "";
    liveTimer = setTimeout(function () {
      ui.live.textContent = text;
    }, 60);
  }

  function describe(patch) {
    if (!patch) return "";
    if (patch.scale) return "Размер шрифта " + patch.scale + " процентов";
    if (patch.theme) {
      for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === patch.theme) return "Цветовая схема: " + THEMES[i].name;
    }
    if (patch.images) return { show: "Изображения показаны", gray: "Изображения чёрно-белые", hide: "Изображения скрыты" }[patch.images] || "";
    if (patch.font) return patch.font === "serif" ? "Шрифт с засечками" : "Шрифт без засечек";
    if ("ls" in patch) return "Межбуквенный интервал: " + ["обычный", "увеличенный", "большой"][patch.ls];
    if ("lh" in patch) return "Межстрочный интервал: " + ["обычный", "увеличенный", "большой"][patch.lh];
    return "";
  }

  /* ------------------------------------------------------------ диалог */
  function openDialog(opener) {
    if (!ui.overlay) return;
    if (!state.on) setState(FIRST_ON, true);
    lastOpener = opener || document.activeElement;
    ui.overlay.hidden = false;
    html.classList.add("bvi-modal-open");
    ui.dialog.focus();
    syncUi();
  }

  function closeDialog() {
    if (!ui.overlay || ui.overlay.hidden) return;
    stopSpeech();
    ui.overlay.hidden = true;
    html.classList.remove("bvi-modal-open");
    var back = lastOpener && document.contains(lastOpener) ? lastOpener : ui.fab;
    try {
      back.focus();
    } catch (e) {}
    lastOpener = null;
  }

  function turnOff() {
    stopSpeech();
    setState({ on: false }, true);
    closeDialog();
  }

  function trapTab(e) {
    var nodes = ui.dialog.querySelectorAll("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ui.dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ------------------------------------------------------------ озвучивание */
  var speaking = false;

  function pageText() {
    var sel = "";
    try {
      sel = String(window.getSelection ? window.getSelection() : "").replace(/\s+/g, " ").trim();
    } catch (e) {}
    if (sel) return sel;
    var root = document.getElementById("main-content") || document.querySelector("main") || document.body;
    var clone = root.cloneNode(true);
    var junk = clone.querySelectorAll(".bvi-ui, .bvi-alt, script, style, noscript, nav, .breadcrumb");
    for (var i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function chunks(text) {
    var parts = text.match(/[^.!?…]+[.!?…]*\s*/g) || [text];
    var out = [];
    var cur = "";
    for (var i = 0; i < parts.length; i++) {
      if ((cur + parts[i]).length > 220 && cur) {
        out.push(cur);
        cur = "";
      }
      cur += parts[i];
      while (cur.length > 260) {
        out.push(cur.slice(0, 240));
        cur = cur.slice(240);
      }
    }
    if (cur.trim()) out.push(cur);
    return out;
  }

  function setSpeakLabel() {
    if (ui.speak) ui.speak.textContent = speaking ? "Остановить чтение" : "Прочитать вслух";
  }

  function stopSpeech() {
    if (!("speechSynthesis" in window)) return;
    speaking = false;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    setSpeakLabel();
  }

  function startSpeech() {
    var text = pageText();
    if (!text) return;
    var parts = chunks(text);
    var synth = window.speechSynthesis;
    synth.cancel();
    speaking = true;
    setSpeakLabel();
    var voices = synth.getVoices ? synth.getVoices() : [];
    var voice = null;
    for (var v = 0; v < voices.length; v++) {
      if (/^ru/i.test(voices[v].lang)) {
        voice = voices[v];
        break;
      }
    }
    parts.forEach(function (p, idx) {
      var u = new window.SpeechSynthesisUtterance(p);
      u.lang = "ru-RU";
      if (voice) u.voice = voice;
      u.rate = 0.95;
      if (idx === parts.length - 1) {
        u.onend = u.onerror = function () {
          speaking = false;
          setSpeakLabel();
        };
      }
      synth.speak(u);
    });
  }

  /* ------------------------------------------------------------ события */
  function onClick(e) {
    var t = e.target;

    var opener = closest(t, "[data-bvi-open]");
    if (opener) {
      e.preventDefault();
      openDialog(opener);
      return;
    }
    if (closest(t, "[data-bvi-off]")) {
      e.preventDefault();
      turnOff();
      return;
    }
    if (closest(t, "[data-bvi-close]")) {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (closest(t, "[data-bvi-reset]")) {
      e.preventDefault();
      setState(extend(extend({}, DEFAULTS), FIRST_ON));
      announce("Настройки сброшены");
      return;
    }
    if (closest(t, "[data-bvi-speak]")) {
      e.preventDefault();
      if (speaking) stopSpeech();
      else startSpeech();
      return;
    }
    var step = closest(t, "[data-bvi-size]");
    if (step) {
      e.preventDefault();
      var idx = SCALES.indexOf(state.scale) + parseInt(step.getAttribute("data-bvi-size"), 10);
      idx = Math.max(0, Math.min(SCALES.length - 1, idx));
      setState({ scale: SCALES[idx] });
      return;
    }
    var set = closest(t, "[data-bvi-set]");
    if (set) {
      e.preventDefault();
      var patch = {};
      var val = set.getAttribute("data-value");
      var g = set.getAttribute("data-bvi-set");
      patch[g] = g === "scale" || g === "ls" || g === "lh" ? parseInt(val, 10) : val;
      setState(patch);
      return;
    }
    // клик по тёмному фону за диалогом
    if (ui.overlay && t === ui.overlay) closeDialog();
  }

  function onKey(e) {
    if (!ui.overlay || ui.overlay.hidden) return;
    if (e.key === "Escape" || e.keyCode === 27) {
      e.preventDefault();
      closeDialog();
    } else if (e.key === "Tab" || e.keyCode === 9) {
      trapTab(e);
    }
  }

  var rzTimer = 0;
  function onResize() {
    if (!state.on) return;
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      apply();
    }, 100);
  }

  function onStorage(e) {
    if (e.key !== KEY) return;
    state = read();
    apply();
  }

  /* ------------------------------------------------------------ запуск */
  // 1. Сразу, ещё в <head>: классы на <html> до первой отрисовки
  apply();

  // 2. Интерфейс — когда готов DOM
  function init() {
    buildUi();
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", function () {
      state = read();
      apply();
    });
    window.addEventListener("pagehide", stopSpeech);
    apply();
    // Динамический контент (виджет расписания и т. п.) — подхватываем таблицы и картинки
    if ("MutationObserver" in window) {
      new MutationObserver(function (list) {
        for (var i = 0; i < list.length; i++) {
          var target = list[i].target;
          if (target && closest(target, ".bvi-ui, .bvi-table-scroll")) continue;
          scheduleDom();
          return;
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener("load", function () {
      apply();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Небольшой публичный API (для отладки и интеграции)
  window.AKVTVision = {
    get state() {
      return extend({}, state);
    },
    set: function (patch) {
      setState(patch);
    },
    open: function () {
      openDialog(document.activeElement);
    },
    off: turnOff
  };
})();
