/**
 * AKVT Progressive Web App (PWA) Engine
 * Реализация добавления сайта на экран «Домой» как приложение для мобильных телефонов (Android & iOS).
 */
(function() {
  'use strict';

  // 1. Регистрация Service Worker со scope: '/'
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(reg) {
          console.log('[AKVT PWA] Service Worker успешно зарегистрирован. Scope:', reg.scope);
        })
        .catch(function(err) {
          console.warn('[AKVT PWA] Ошибка регистрации Service Worker:', err);
        });
    });
  }

  // 2. Проверка, запущен ли сайт уже в автономном режиме (Standalone / Установлен)
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator.standalone === true) ||
                     (document.referrer && document.referrer.includes('android-app://'));

  if (isStandalone) {
    console.log('[AKVT PWA] Сайт работает в автономном режиме приложения (Standalone).');
    return;
  }

  // Проверка таймаута скрытия баннера пользователем (не беспокоить 3 дня при закрытии)
  var dismissedUntil = localStorage.getItem('akvt_pwa_dismissed');
  if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
    return;
  }

  var deferredPrompt = null;
  var ua = window.navigator.userAgent.toLowerCase();
  var isIos = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  var isMobile = isIos || /android|mobile|blackberry|iemobile|kindle|silk|opera mini/i.test(ua) || window.innerWidth <= 820;

  // 3. Создание UI баннера установки и модальных окон
  function createBanner() {
    if (document.getElementById('akvt-pwa-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'akvt-pwa-banner';
    banner.className = 'akvt-pwa-banner';
    banner.innerHTML = [
      '<div class="akvt-pwa-card">',
      '  <div class="akvt-pwa-left">',
      '    <img src="/icons/icon-192.png" alt="АКВТ" class="akvt-pwa-icon" />',
      '    <div class="akvt-pwa-info">',
      '      <span class="akvt-pwa-title">Приложение АКВТ</span>',
      '      <span class="akvt-pwa-desc">Быстрый доступ на экране «Домой»</span>',
      '    </div>',
      '  </div>',
      '  <div class="akvt-pwa-right">',
      '    <button id="akvt-pwa-install-btn" class="akvt-pwa-btn">Установить</button>',
      '    <button id="akvt-pwa-close-btn" class="akvt-pwa-close" title="Закрыть" aria-label="Закрыть">✕</button>',
      '  </div>',
      '</div>',
      '<div id="akvt-pwa-instruction-modal" class="akvt-pwa-ios-modal">',
      '  <div class="akvt-pwa-ios-content">',
      '    <div class="akvt-pwa-ios-header">',
      '      <span id="akvt-pwa-modal-title" class="akvt-pwa-ios-title">Как добавить АКВТ на экран «Домой»</span>',
      '      <button id="akvt-pwa-modal-close" class="akvt-pwa-close">✕</button>',
      '    </div>',
      '    <div id="akvt-pwa-modal-body"></div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(banner);

    // Закрытие баннера
    document.getElementById('akvt-pwa-close-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      banner.classList.remove('show');
      localStorage.setItem('akvt_pwa_dismissed', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
    });

    // Закрытие модального окна
    document.getElementById('akvt-pwa-modal-close').addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('akvt-pwa-instruction-modal').classList.remove('active');
    });

    // Клик по оверлею закрывает модалку
    document.getElementById('akvt-pwa-instruction-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });

    // Обработка кнопки Установить
    document.getElementById('akvt-pwa-install-btn').addEventListener('click', function() {
      if (deferredPrompt) {
        // Нативный диалог установки в Chromium/Android
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choice) {
          if (choice && choice.outcome === 'accepted') {
            console.log('[AKVT PWA] Пользователь установил приложение АКВТ.');
            banner.classList.remove('show');
          }
          deferredPrompt = null;
        });
      } else if (isIos) {
        // Инструкция для Safari на iOS
        showInstructions('ios');
      } else {
        // Универсальная инструкция для Android / других браузеров
        showInstructions('android');
      }
    });

    // Плавное появление через небольшую паузу
    setTimeout(function() {
      banner.classList.add('show');
    }, 1200);
  }

  function showInstructions(type) {
    var modal = document.getElementById('akvt-pwa-instruction-modal');
    var modalTitle = document.getElementById('akvt-pwa-modal-title');
    var modalBody = document.getElementById('akvt-pwa-modal-body');
    if (!modal || !modalBody) return;

    if (type === 'ios') {
      modalTitle.textContent = 'Добавление на экран «Домой» (iPhone/iPad)';
      modalBody.innerHTML = [
        '<ol class="akvt-pwa-ios-steps">',
        '  <li>Нажмите кнопку <strong>«Поделиться»</strong> <svg class="ios-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> в нижней панели Safari.</li>',
        '  <li>В меню найдите и нажмите <strong>«На экран „Домой“»</strong> <svg class="ios-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>.</li>',
        '  <li>Нажмите <strong>«Добавить»</strong> в правом верхнем углу экрана.</li>',
        '</ol>',
        '<div class="akvt-pwa-ios-foot">Иконка колледжа АКВТ мгновенно появится на вашем экране как приложение!</div>'
      ].join('\n');
    } else {
      modalTitle.textContent = 'Добавление на экран «Домой» (Android)';
      modalBody.innerHTML = [
        '<ol class="akvt-pwa-ios-steps">',
        '  <li>Нажмите кнопку <strong>Меню браузера</strong> (три точки <strong style="font-size:16px;">⋮</strong> в верхнем или нижнем углу).</li>',
        '  <li>Выберите пункт <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>.</li>',
        '  <li>Подтвердите добавление, нажав <strong>«Установить»</strong>.</li>',
        '</ol>',
        '<div class="akvt-pwa-ios-foot">Иконка АКВТ появится на рабочем столе смартфона с быстрым доступом к сайту!</div>'
      ].join('\n');
    }

    modal.classList.add('active');
  }

  // 4. Перехват события `beforeinstallprompt` (Android/Chrome)
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    createBanner();
  });

  // 5. Автоматический показ на мобильных устройствах
  if (isMobile) {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(createBanner, 1500);
      });
    } else {
      setTimeout(createBanner, 1500);
    }
  }

  // 6. Глобальная функция для ручного вызова (из шапки или подвала)
  window.akvtInstallApp = function() {
    createBanner();
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else if (isIos) {
      showInstructions('ios');
    } else {
      showInstructions('android');
    }
  };

})();
