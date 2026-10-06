# AKVT Site Audit

**Start:** 2026-09-24 00:48  
**End:** 2026-09-24  
**Scope:** local mirror `E:\аквт\site` (http://127.0.0.1:8000/)  
**Source of truth:** https://www.akvt.ru/

---

## [BUG-001] Версия для слабовидящих (BVI)

Категория: Accessibility  
Критичность: CRITICAL  
Страница: весь сайт  
Описание: Нужна полноценная спецверсия по практике сайтов колледжей/вузов РФ (BVI-паттерн), а не «сломанный» переключатель темы.  
Ориентир (не akvt.ru): панели BVI на сайтах СПО — размер шрифта, 3–4 цветовые схемы, показ/скрытие изображений, интервал, localStorage, ARIA.  
Исправление:  
* `vision.js` — панель `#akvt-bvi-panel`: шрифт 100/125/150/200%, темы bw/wb/blue/beige, images on/off, spacing, сброс, обычная версия;  
* CSS в `style.css` — полный BVI-пакет;  
* кнопка «глаз» → `#akvt-bvi-open` открывает панель.  
Проверка: `node --check`; HTTP 200; CSS содержит `akvt-bvi-panel` и `bvi-theme-*`.

---

## [BUG-002] Missing robots.txt / sitemap.xml

Категория: SEO  
Критичность: HIGH  
Страница: site root  
Описание: Не было `robots.txt` и XML sitemap.  
Как обнаружено: `Test-Path`  
Исправление: созданы `robots.txt` и `sitemap.xml` (292 URL из локальных `index.html`).  
Результат: HTTP 200 `/robots.txt`, `/sitemap.xml`; `<loc>` count > 50.

---

## [BUG-003] Footer absolute paths + missing official email

Категория: Content / UX  
Критичность: HIGH  
Страница: footer (all)  
Описание: В подвале не было email с официального сайта; контакты неполные.  
Как обнаружено: сверка с akvt.ru (`office@akvt.astrobl.ru`).  
Исправление: email добавлен в `partials/footer.html` и во все 292 baked HTML.  
Результат: home + contacts содержат `office@akvt.astrobl.ru`.

---

## [BUG-004] Accessibility: no skip link / weak focus

Категория: Accessibility  
Критичность: HIGH  
Страница: all  
Описание: Нет skip-to-content; focus styles слабые.  
Исправление: `a.skip-link` + `#main-content` на 292 страницах; CSS `:focus-visible` и skip-link pack; aria на кнопке vision.  
Результат: asserts skip-link + main-content on `/`.

---

## [BUG-005] Vision CSS incomplete for homepage chrome

Категория: Accessibility  
Критичность: MEDIUM  
Страница: home / global  
Описание: `vision-mode` не покрывал hp-header, bento, footer band — тёмный UI оставался.  
Исправление: расширены rules в `style.css` (hp-*, bento, colophon, card-ink, images grayscale).  
Результат: CSS contains vision rules for homepage components.

---

## [BUG-006] Schedule mobile UX

Категория: Responsive / Schedule  
Критичность: MEDIUM  
Страница: `/students/raspisanie-zanyatij/`, teachers  
Описание: touch targets и input zoom на iOS.  
Исправление: mobile block in `akvt-rasp.css` (min 44px, font-size 16px input, fallback chips).  
Результат: CSS present; schedule page still loads XLS (2 files, no s-0710).

---

## [BUG-007] Keyboard: mobile menu not closable via Escape

Категория: Accessibility  
Критичность: MEDIUM  
Страница: all with hp-header  
Исправление: Escape handler in `js/main.js` closes mega + burger drawer + vision hash.  
Результат: `node --check main.js` OK.

---

## [BUG-008] Home missing Open Graph / canonical

Категория: SEO  
Критичность: MEDIUM  
Страница: `/`  
Исправление: og:* + canonical + theme-color on `index.html`.  
Результат: assert og:title on `/`.

---

## [INFO] Broken historical news links (LOW)

Категория: Links  
Критичность: LOW  
Описание: ~30 deep links на старые новости 2020–2024 отсутствуют в локальном зеркале (не в crawl seeds).  
Решение: не блокирует основные сценарии; 198/198 ссылок с home/karta/students/schedule — 200 OK.  
Оставлено: архивные URL без локальных файлов (нужна полная выгрузка с akvt.ru при необходимости).

---

## [INFO] Search form has no backend on static host

Категория: Forms  
Критичность: LOW  
Описание: WP search `?s=` не работает на static python server.  
Статус: форма не 500; пустой submit не критичен. Полноценный search index — out of scope without backend.

---

## [INFO] CF7 / captcha stubs

Категория: Forms  
Критичность: LOW  
Описание: contact-form-7 и captcha JS — stubs (404 устранены ранее). Реальная отправка форм требует WP backend на akvt.ru.

---

# Crawl summary

| Check | Result |
|--------|--------|
| Seed pages HTTP | all 200 |
| Discovered links from home/karta/students/schedule | **198 OK, 0 broken** |
| Schedule XLS HTTP | 200 both files |
| XLS parse (prior) | 74 groups, 1237 lessons |
| JS syntax main/vision/schedule | OK |
| Vision toggle logic | fixed by id |
| robots/sitemap | present |
| skip-link / main-content | all pages |
| Official email | in footer + contacts |

---

# FINAL AUDIT

Всего проверено seed-страниц: **24+**  
Обнаружено внутренних ссылок (crawl): **198**  
Сломанных в crawl: **0**  

Найдено проблем (задокументировано): **8+**  
CRITICAL: 1 (vision) → **исправлено**  
HIGH: 3 → **исправлено**  
MEDIUM: 3 → **исправлено**  
LOW/INFO: 3 → зафиксировано  

Исправлено: **BUG-001 … BUG-008**  
Осталось: архивные 404 новостей вне зеркала; search/CF7 без WP backend  

Regression: HTTP fail=0; ALL_ASSERTIONS_PASSED (home, schedule, SEO, contacts, IGA content)

### Checklist

- [x] Основные страницы 200  
- [x] Навигация header/footer  
- [x] Расписание files + script  
- [x] Vision JS  
- [x] Skip link / focus  
- [x] robots + sitemap.xml  
- [x] Email с akvt.ru  
- [x] Console-level JS syntax  
- [x] Mobile CSS schedule  
- [x] Keyboard Escape  
- [x] AUDIT / CHANGELOG / WORK_LOG  
- [ ] Полный browser visual на всех 292 URL (ограничение: headless HTTP crawl)  
- [ ] Реальный CF7 submit на production WP  

---

*Аудит выполнен автономно против локального сервера и данных akvt.ru.*
