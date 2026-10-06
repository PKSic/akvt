/**
 * AKVT — версия для слабовидящих (BVI)
 * Управление только через модалку (#openModal), без верхней панели.
 * Шрифт · цвет · картинки · интервал · localStorage
 */
(function () {
  "use strict";

  var KEY = "akvt_bvi_v2";
  var DEFAULTS = {
    on: false,
    font: 100,
    theme: "bw",
    images: true,
    spacing: "normal",
  };

  function read() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || typeof raw !== "object") return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, raw);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function apply(state) {
    var html = document.documentElement;
    var body = document.body;

    // remove old top panel if left from previous version
    var old = document.getElementById("akvt-bvi-panel");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    body.classList.remove("bvi-panel-open");

    html.classList.toggle("bvi-on", !!state.on);
    body.classList.toggle("bvi-on", !!state.on);
    body.classList.toggle("vision-mode", !!state.on);
    html.classList.toggle("vision-mode", !!state.on);

    html.classList.remove("bvi-font-100", "bvi-font-125", "bvi-font-150", "bvi-font-200");
    html.classList.remove("vf-15", "vf-20", "vf-25");
    if (state.on) {
      var f = String(state.font || 100);
      html.classList.add("bvi-font-" + f);
      if (f === "125") html.classList.add("vf-15");
      else if (f === "150") html.classList.add("vf-20");
      else if (f === "200") html.classList.add("vf-25");
    }

    html.classList.remove("bvi-theme-bw", "bvi-theme-wb", "bvi-theme-blue", "bvi-theme-beige");
    if (state.on) html.classList.add("bvi-theme-" + (state.theme || "bw"));

    html.classList.toggle("bvi-no-images", !!(state.on && !state.images));
    html.classList.toggle("bvi-spacing-wide", !!(state.on && state.spacing === "wide"));

    // sync aria-pressed in modal
    var modal = document.getElementById("openModal");
    if (modal) {
      Array.prototype.forEach.call(modal.querySelectorAll("[data-bvi]"), function (btn) {
        var kind = btn.getAttribute("data-bvi");
        var val = btn.getAttribute("data-value");
        var pressed = false;
        if (kind === "font") pressed = state.on && String(state.font) === String(val);
        else if (kind === "theme") pressed = state.on && state.theme === val;
        else if (kind === "images") pressed = state.on && state.images === (val === "1");
        else if (kind === "spacing") pressed = state.on && state.spacing === val;
        else if (kind === "on") pressed = !!state.on;
        else if (kind === "off") pressed = !state.on;
        btn.setAttribute("aria-pressed", pressed ? "true" : "false");
        btn.classList.toggle("is-active", pressed);
      });
    }

    var trigger = document.querySelector("a.start");
    if (trigger) {
      trigger.setAttribute("aria-pressed", state.on ? "true" : "false");
      trigger.classList.toggle("is-bvi-active", !!state.on);
    }
  }

  function setState(patch) {
    var state = Object.assign(read(), patch);
    write(state);
    apply(state);
    return state;
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    apply(read());

    Array.prototype.forEach.call(document.querySelectorAll(".modalDialog form"), function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
      });
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("#openModal [data-bvi], #openModal .vjlink, #akvt-bvi-apply, #akvt-bvi-reset, #solevarnya, #papich");
      if (!btn) return;

      // don't block the eye link — CSS :target opens modal
      e.preventDefault();

      var kind = btn.getAttribute("data-bvi");
      var val = btn.getAttribute("data-value");
      var id = btn.id || "";
      var name = btn.name || "";

      if (id === "akvt-bvi-apply" || id === "solevarnya" || kind === "on") {
        setState({ on: true });
        return;
      }
      if (id === "akvt-bvi-reset" || id === "papich" || kind === "off") {
        setState({ on: false, font: 100, theme: "bw", images: true, spacing: "normal" });
        if (location.hash === "#openModal") location.hash = "#close";
        return;
      }

      // legacy name=1|15|20|25
      if (!kind && name) {
        var fontMap = { "1": 100, "15": 125, "20": 150, "25": 200 };
        if (fontMap[String(name)] != null) {
          setState({ on: true, font: fontMap[String(name)] });
          return;
        }
      }

      if (kind === "font") setState({ on: true, font: parseInt(val, 10) || 100 });
      else if (kind === "theme") setState({ on: true, theme: val });
      else if (kind === "images") setState({ on: true, images: val === "1" });
      else if (kind === "spacing") setState({ on: true, spacing: val });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && location.hash === "#openModal") {
        location.hash = "#close";
      }
    });
  });
})();
