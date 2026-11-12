/**
 * React News Hub — Интерактивный компонент новостей, рубрик и тегов АКВТ
 * Разработан на React 18 с использованием хуков (useState, useMemo, useEffect, useCallback)
 */
(function () {
  'use strict';

  function initReactNewsHub() {
    const mountPoint = document.getElementById('react-news-hub');
    if (!mountPoint) return;

    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      console.warn('[React News Hub] Ожидание загрузки библиотек React...');
      return;
    }

    const { createElement: h, useState, useEffect, useMemo, useCallback } = React;

    const CATEGORIES = [
      { id: 'all', label: 'Все новости' },
      { id: 'news', label: 'Новости АКВТ' },
      { id: 'it-kub', label: 'IT-Куб' },
      { id: 'studentam', label: 'Студентам' },
      { id: 'abiturientam', label: 'Абитуриентам' },
      { id: 'meropriyatiya', label: 'Мероприятия' },
      { id: 'obyavleniya', label: 'Объявления' },
      { id: 'sport', label: 'Спорт' },
      { id: 'dostizheniya', label: 'Достижения' },
    ];

    // Форматирование даты: YYYY-MM-DD -> DD.MM.YYYY
    function formatDate(iso) {
      if (!iso) return '';
      const parts = iso.split('-');
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
      return iso;
    }

    // Главный корневой компонент
    function ReactNewsHubApp({ initialCategory = 'all' }) {
      const [news, setNews] = useState([]);
      const [loading, setLoading] = useState(true);
      const [category, setCategory] = useState(initialCategory);
      const [selectedTag, setSelectedTag] = useState(null);
      const [query, setQuery] = useState('');
      const [sort, setSort] = useState('newest');

      // Загрузка индекса новостей
      useEffect(() => {
        let isMounted = true;
        fetch('/admin/pages-index.json')
          .then((res) => {
            if (!res.ok) throw new Error('Сетевой ответ не OK');
            return res.json();
          })
          .then((data) => {
            if (!isMounted) return;
            const newsItems = (data.pages || []).filter((p) => p.n);
            setNews(newsItems);
            setLoading(false);
          })
          .catch((err) => {
            console.warn('[React News Hub] Fallback к DOM-списку:', err);
            // Запасной вариант: парсим существующие ссылки из DOM архива
            const existingLinks = Array.from(document.querySelectorAll('.item_archive a'));
            const fallbackNews = existingLinks.map((a) => {
              const href = a.getAttribute('href') || '';
              const match = /(\d{4}\/\d{2}(?:\/\d{2})?\/[^/]+)/.exec(href);
              const dir = match ? match[1] : '';
              const isItKub = href.includes('it-kub') || location.pathname.includes('it-kub');
              const dParts = /(\d{4})\/(\d{2})\/(\d{2})/.exec(href);
              const dateIso = dParts ? `${dParts[1]}-${dParts[2]}-${dParts[3]}` : '2026-09-01';
              return {
                d: dir,
                t: a.innerText.trim(),
                n: 1,
                date: dateIso,
                cats: isItKub ? ['it-kub', 'news'] : ['news'],
                tags: [],
              };
            });
            if (isMounted) {
              setNews(fallbackNews);
              setLoading(false);
            }
          });
        return () => {
          isMounted = false;
        };
      }, []);

      // Вычисление всех доступных тегов с количеством
      const allTags = useMemo(() => {
        const counts = {};
        news.forEach((item) => {
          (item.tags || []).forEach((t) => {
            const clean = t.trim();
            if (clean) counts[clean] = (counts[clean] || 0) + 1;
          });
        });
        return Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
      }, [news]);

      // Подсчет количества новостей по категориям
      const catCounts = useMemo(() => {
        const counts = { all: news.length };
        CATEGORIES.forEach((c) => {
          if (c.id === 'all') return;
          counts[c.id] = news.filter((item) => {
            const cats = item.cats || (item.d.includes('it-kub') ? ['it-kub', 'news'] : ['news']);
            return cats.includes(c.id);
          }).length;
        });
        return counts;
      }, [news]);

      // Фильтрация и сортировка новостей (useMemo)
      const filteredNews = useMemo(() => {
        let list = news.filter((item) => {
          // Фильтр по рубрике
          if (category !== 'all') {
            const cats = item.cats || (item.d.includes('it-kub') ? ['it-kub', 'news'] : ['news']);
            if (!cats.includes(category)) return false;
          }
          // Фильтр по тегу
          if (selectedTag) {
            const tags = item.tags || [];
            if (!tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) return false;
          }
          // Фильтр по поисковому запросу
          if (query.trim()) {
            const q = query.trim().toLowerCase();
            const inTitle = item.t.toLowerCase().includes(q);
            const inTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
            if (!inTitle && !inTags) return false;
          }
          return true;
        });

        // Сортировка
        list.sort((a, b) => {
          if (sort === 'newest') return (b.date || '').localeCompare(a.date || '') || b.d.localeCompare(a.d);
          return (a.date || '').localeCompare(b.date || '') || a.d.localeCompare(b.d);
        });

        return list;
      }, [news, category, selectedTag, query, sort]);

      // Сброс всех фильтров
      const handleReset = useCallback(() => {
        setCategory('all');
        setSelectedTag(null);
        setQuery('');
      }, []);

      // Если идет загрузка
      if (loading) {
        return h('div', { className: 'rnh-container', style: { textAlign: 'center', padding: '40px' } },
          h('div', { style: { fontSize: '15px', color: '#64748b' } }, 'Загрузка React News Hub...')
        );
      }

      return h('div', { className: 'rnh-container' },
        // 1. Поиск и фильтры
        h('div', { className: 'rnh-head' },
          h('div', { className: 'rnh-search-bar' },
            h('span', { className: 'rnh-search-icon' },
              h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                h('circle', { cx: 11, cy: 11, r: 8 }),
                h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
              )
            ),
            h('input', {
              type: 'text',
              className: 'rnh-search-input',
              placeholder: 'Живой поиск новостей по заголовку или тегам (например: хакатон, конкурс, ИИ)...',
              value: query,
              onChange: (e) => setQuery(e.target.value),
            }),
            query ? h('button', { className: 'rnh-clear-btn', onClick: () => setQuery(''), title: 'Очистить' }, '×') : null
          ),

          // Пилюли рубрик
          h('div', { className: 'rnh-cats-wrapper' },
            CATEGORIES.map((cat) =>
              h('button', {
                key: cat.id,
                type: 'button',
                className: `rnh-cat-pill ${category === cat.id ? 'active' : ''}`,
                onClick: () => {
                  setCategory(cat.id);
                  setSelectedTag(null); // сбрасываем тег при смене категории для удобства
                },
              },
                cat.label,
                h('span', { className: 'rnh-cat-count' }, catCounts[cat.id] || 0)
              )
            )
          ),

          // Облако тегов (если теги есть в базе)
          allTags.length > 0 ? h('div', { className: 'rnh-tags-wrapper' },
            h('span', { className: 'rnh-tags-label' }, 'Теги:'),
            allTags.slice(0, 15).map((tg) =>
              h('button', {
                key: tg.name,
                type: 'button',
                className: `rnh-tag-chip ${selectedTag === tg.name ? 'active' : ''}`,
                onClick: () => setSelectedTag(selectedTag === tg.name ? null : tg.name),
              },
                `#${tg.name}`,
                h('span', { style: { marginLeft: 4, opacity: 0.7 } }, `(${tg.count})`)
              )
            ),
            selectedTag ? h('button', {
              type: 'button',
              className: 'rnh-tag-chip',
              style: { background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
              onClick: () => setSelectedTag(null),
            }, 'Сбросить тег ✕') : null
          ) : null
        ),

        // 2. Мета-строка статуса и сортировка
        h('div', { className: 'rnh-status-bar' },
          h('div', null,
            'Найдено: ',
            h('span', { className: 'rnh-count-badge' }, `${filteredNews.length} новостей`),
            category !== 'all' ? ` • Рубрика: ${CATEGORIES.find((c) => c.id === category)?.label}` : '',
            selectedTag ? ` • Тег: #${selectedTag}` : '',
            query ? ` • Поиск: «${query}»` : ''
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', null, 'Сортировка:'),
            h('select', {
              className: 'rnh-sort-select',
              value: sort,
              onChange: (e) => setSort(e.target.value),
            },
              h('option', { value: 'newest' }, 'Сначала новые'),
              h('option', { value: 'oldest' }, 'Сначала старые')
            )
          )
        ),

        // 3. Сетка карточек новостей или пустое состояние
        filteredNews.length > 0 ? h('div', { className: 'rnh-grid' },
          filteredNews.map((item) => {
            const isItKub = (item.cats || []).includes('it-kub') || item.d.includes('it-kub');
            const href = `/${item.d}/index.html`;

            return h('article', { key: item.d, className: 'rnh-card' },
              h('div', { className: 'rnh-card-header' },
                h('span', { className: 'rnh-card-date' }, formatDate(item.date)),
                h('span', { className: `rnh-card-cat-badge ${isItKub ? 'itkub' : ''}` },
                  isItKub ? 'IT-Куб' : 'АКВТ'
                )
              ),
              h('h3', { className: 'rnh-card-title' },
                h('a', { href: href }, item.t)
              ),
              // Теги карточки
              (item.tags && item.tags.length > 0) ? h('div', { className: 'rnh-card-tags' },
                item.tags.map((t) =>
                  h('span', {
                    key: t,
                    className: 'rnh-card-tag',
                    onClick: (e) => {
                      e.preventDefault();
                      setSelectedTag(t);
                    },
                    title: `Фильтровать по тегу #${t}`,
                  }, `#${t}`)
                )
              ) : null,
              h('div', { className: 'rnh-card-foot' },
                h('a', { href: href, className: 'rnh-card-link' },
                  'Читать новость',
                  h('span', { style: { fontSize: '15px' } }, '→')
                )
              )
            );
          })
        ) : h('div', { className: 'rnh-empty' },
          h('div', { className: 'rnh-empty-title' }, 'По выбранным критериям новостей не найдено'),
          h('p', null, 'Попробуйте изменить поисковый запрос или сбросить фильтры.'),
          h('button', { type: 'button', className: 'rnh-reset-btn', onClick: handleReset }, 'Сбросить фильтры')
        ),

        // 4. Подвал виджета
        h('div', { className: 'rnh-badge-foot' },
          h('span', null, 'Интерактивный каталог новостей и событий АКВТ'),
          h('div', { className: 'rnh-react-pill' },
            h('svg', { width: 14, height: 14, viewBox: '-11.5 -10.23174 23 20.46348', fill: 'none' },
              h('circle', { cx: 0, cy: 0, r: 2.05, fill: '#0284c7' }),
              h('g', { stroke: '#0284c7', strokeWidth: 1, fill: 'none' },
                h('ellipse', { rx: 11, ry: 4.2 }),
                h('ellipse', { rx: 11, ry: 4.2, transform: 'rotate(60)' }),
                h('ellipse', { rx: 11, ry: 4.2, transform: 'rotate(120)' })
              )
            ),
            `React Component (v${React.version})`
          )
        )
      );
    }

    // Определение контекста страницы для начальной категории
    const pathname = location.pathname.toLowerCase();
    let initialCat = 'all';
    if (pathname.includes('/category/it-kub')) initialCat = 'it-kub';
    else if (pathname.includes('/category/news')) initialCat = 'news';

    // Монтирование React
    try {
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(mountPoint);
        root.render(h(ReactNewsHubApp, { initialCategory: initialCat }));
      } else {
        ReactDOM.render(h(ReactNewsHubApp, { initialCategory: initialCat }), mountPoint);
      }
      console.log(`[React News Hub] Успешно смонтирован React-компонент (React v${React.version})`);
    } catch (err) {
      console.error('[React News Hub] Ошибка монтирования React:', err);
    }
  }

  // Запуск при готовности DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReactNewsHub);
  } else {
    initReactNewsHub();
  }
})();
