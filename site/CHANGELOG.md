# CHANGELOG — AKVT

## 2026-09-24 (audit session)

### BUG-001 BVI (версия для слабовидящих)

* По стандарту панелей BVI для сайтов колледжей (не по akvt.ru).
* Панель: размер шрифта, 4 цветовые схемы, скрытие картинок, интервал, localStorage.
* Файлы: `vision.js`, CSS BVI в `style.css`, кнопка `#akvt-bvi-open` в footer.

### BUG-002 SEO files

* Добавлены `robots.txt`, `sitemap.xml` (292 URL).

### BUG-003 Contacts email

* `office@akvt.astrobl.ru` в footer (partial + 292 HTML) — с официального сайта.

### BUG-004 / BUG-005 A11y

* Skip-link + `#main-content` на всех HTML.
* CSS focus-visible, vision-mode для homepage chrome, aria на кнопке vision.

### BUG-006 Schedule mobile

* `css/akvt-rasp.css` — touch targets, iOS input 16px.

### BUG-007 Keyboard

* Escape в `js/main.js` закрывает mobile menu / mega / vision modal.

### BUG-008 Home SEO

* Open Graph + canonical + theme-color на главной.

### Проверка

* HTTP crawl 198/198 OK; node --check main.js + vision.js; python asserts ALL_ASSERTIONS_PASSED.

### Результат

* CRITICAL/HIGH по аудиту закрыты; LOW задокументированы.
