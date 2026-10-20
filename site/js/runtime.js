/**
 * AKVT Dynamic Runtime Module (B5CH Architecture)
 * Signature: PKSic & dakroy
 */
(function () {
  "use strict";

  // =========================================================================
  // 1. Web Audio API — 8-битный ретро-синтезатор звуков (без аудиофайлов)
  // =========================================================================
  var audioCtx = null;
  function getAudio() {
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  // 8-битный аркадный звук бонуса (монетка)
  function playCoin() {
    var ac = getAudio();
    if (!ac) return;
    try {
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, t); // B5
      osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch (e) {}
  }

  // 8-битный звук падения (свист вниз)
  function playFallSound() {
    var ac = getAudio();
    if (!ac) return;
    try {
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(750, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.7);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.75);
    } catch (e) {}
  }

  // 8-битный звук варпа / восстановления (свист вверх)
  function playRestoreSound() {
    var ac = getAudio();
    if (!ac) return;
    try {
      var t = ac.currentTime;
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(1150, t + 0.45);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.48);
    } catch (e) {}
  }

  // Экспорт звуков для других пасхалок сайта
  window.__b5ch_sound = {
    coin: playCoin,
    fall: playFallSound,
    restore: playRestoreSound
  };

  // Озвучивание всплытия любого пасхалочного бейджа на сайте
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.id === "akvt-easter-toast" || node.id === "easter-egg-3199") {
          playCoin();
          return;
        }
      }
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      observer.observe(document.body, { childList: true });
    });
  }

  // =========================================================================
  // 2. Гравитационный крах (Gravity Collapse)
  // Активация: ввод «fall» или «boom» или «падай» на клавиатуре
  // =========================================================================
  var isFalling = false;
  function triggerGravityCollapse() {
    if (isFalling) return;
    isFalling = true;

    // Выбираем основные видимые интерактивные блоки страницы
    var selector = ".card, .hp-card, article, .post, .widget, .banner, .rules-grid > div, .rpwe-li, table, h1, h2, .logo, .hp-hero, .btn, .pwa-m-install";
    var nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) {
      nodes = Array.from(document.querySelectorAll("main > *, #content > *, .wrap > *"));
    }

    var targets = [];
    var viewH = window.innerHeight;

    nodes.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < viewH && rect.height > 20) {
        targets.push({
          el: el,
          origTransition: el.style.transition || "",
          origTransform: el.style.transform || "",
          origZ: el.style.zIndex || ""
        });
      }
    });

    if (!targets.length) {
      isFalling = false;
      return;
    }

    // 1. Звук падения
    playFallSound();

    // 2. Анимация физического падения вниз с хаотичным вращением
    targets.forEach(function (item) {
      var dropDist = viewH - item.el.getBoundingClientRect().top + Math.random() * 200 + 40;
      var rot = (Math.random() - 0.5) * 60;
      var delay = Math.random() * 0.15;
      item.el.style.transition = "transform 0.75s cubic-bezier(0.55, 0.085, 0.68, 0.53) " + delay + "s";
      item.el.style.transform = "translateY(" + dropDist + "px) rotate(" + rot + "deg)";
      item.el.style.zIndex = "999";
    });

    // 3. Через 3.5 секунды — сборка обратно на места и звук восстановления
    setTimeout(function () {
      playRestoreSound();
      targets.forEach(function (item) {
        item.el.style.transition = "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
        item.el.style.transform = item.origTransform || "none";
      });

      // Показ фирменного бейджа
      showEasterNotification("Б5Ч // Гравитация восстановлена: PKSic & dakroy");

      // Очистка стилей после возврата
      setTimeout(function () {
        targets.forEach(function (item) {
          item.el.style.transition = item.origTransition;
          item.el.style.transform = item.origTransform;
          item.el.style.zIndex = item.origZ;
        });
        isFalling = false;
      }, 750);
    }, 3500);
  }

  // Функция для стильного уведомления
  function showEasterNotification(msg) {
    var toast = document.createElement("div");
    toast.id = "akvt-easter-toast";
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999999;background:rgba(15,23,42,0.96);backdrop-filter:blur(10px);color:#f8fafc;padding:12px 20px;border-radius:12px;border:1px solid rgba(56,189,248,0.4);box-shadow:0 12px 32px rgba(0,0,0,0.5);font-family:system-ui,-apple-system,sans-serif;font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(12px);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);pointer-events:none;";
    toast.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg><span>' + msg + '</span>';
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4500);
  }

  // Отслеживание клавиатурного ввода для гравитации (с поддержкой русской раскладки и e.code)
  var keySeq = [];
  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;
    var code = e.code || "";
    var ch = (e.key || "").toLowerCase();
    keySeq.push({ code: code, key: ch });
    if (keySeq.length > 15) keySeq.shift();

    var strCodes = keySeq.map(function (k) { return k.code; }).join(" ");
    var strKeys = keySeq.map(function (k) { return k.key; }).join("");

    if (strCodes.indexOf("KeyF KeyA KeyL KeyL") !== -1 ||
        strCodes.indexOf("KeyB KeyO KeyO KeyM") !== -1 ||
        strKeys.indexOf("fall") !== -1 ||
        strKeys.indexOf("boom") !== -1 ||
        strKeys.indexOf("афдд") !== -1 ||
        strKeys.indexOf("иооь") !== -1 ||
        strKeys.indexOf("пад") !== -1 ||
        strKeys.indexOf("бум") !== -1) {
      keySeq = [];
      triggerGravityCollapse();
    }
  }, true);

  // Экспорт функции в глобальный скоуп
  window.__b5ch_gravity = triggerGravityCollapse;
})();
