# CHANGELOG — AKVT

## 2026-10-11 — Режим для слабовидящих: полная переработка

Режим переписан с нуля и работает на всех 292 страницах сайта (и в теме WordPress).

* **Раскладка следует за масштабом.** При 200 % шрифта страница перестраивается как при зуме
  в браузере (бургер-меню, одна колонка, карточки в столбик). Для этого все `@media (max-width)`
  сайта автоматически дублируются под «эффективную ширину» (ширина окна ÷ масштаб) —
  `css/vision-layout.css` (генерируется `tools/build-vision-layout.py`).
* Размер шрифта 100–175–200 %, 5 цветовых схем (контраст не ниже 7:1), изображения
  (показать / чёрно-белые / скрыть — вместо скрытых показывается alt-текст), шрифт с засечками,
  межбуквенный и межстрочный интервал, озвучивание страницы или выделенного текста.
* Любой мелкий текст автоматически поднимается до базового размера; встроенные (inline) стили
  редакторов WordPress (цвет, размер, выравнивание по ширине, float) нейтрализуются.
* Доступность самого режима: диалог с ловушкой фокуса, Escape, `aria-pressed`, объявления
  для экранных дикторов, видимый фокус, крупные цели нажатия (48 px), ссылка первой в порядке Tab.
* Настройки хранятся в `localStorage` (`akvt_bvi_v3`), общие для всех страниц и вкладок;
  старые настройки (`akvt_bvi_v2`) переносятся автоматически. Без `localStorage` режим работает.
* Разметка панели больше не лежит в HTML страниц: интерфейс создаёт `js/vision.js`.
  Удалены: модальное окно `#openModal` (из 292 страниц и `partials/footer.html`), старый
  `wp-content/themes/twentyeleven-child/js/vision.js`, ~800 строк CSS из `style.css`.
* Обычная версия сайта не изменилась (проверено попиксельно), кроме новой текстовой ссылки
  «Версия для слабовидящих» в подвале.

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
