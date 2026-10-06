<?php
/**
 * Template Name: Расписание занятий
 * Template Post Type: page
 *
 * @package AKVT_Theme
 */

if (!defined('ABSPATH')) exit;

wp_enqueue_style('akvt-rasp');
wp_enqueue_script('xlsx');

get_header();
?>

<div id="main-content">
  <div id="main">
    <div id="tape-wrap">
      <div class="wrap title">
        <div class="breadcrumb">
          <span><a title="Перейти к АКВТ." href="<?php echo esc_url(home_url('/')); ?>" class="home">АКВТ</a></span>
          <?php if ($post->post_parent): ?>
            <span><a href="<?php echo esc_url(get_permalink($post->post_parent)); ?>"><?php echo esc_html(get_the_title($post->post_parent)); ?></a></span>
          <?php endif; ?>
          <span><span class="current-item"><?php the_title(); ?></span></span>
        </div>
      </div>
    </div>

    <div class="wrap above">
      <?php get_sidebar(); ?>

      <div id="primary_page">
        <div id="content_page" role="main">
          <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="entry-header">
              <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="entry-content">
              <div class="akvt-rasp">
                <div class="top">
                  <span class="eyebrow">Студентам · Расписание</span>
                  <p class="section-lead">Найдите свою группу — актуальное расписание занятий на текущую неделю откроется ниже. Данные обновляются администрацией колледжа.</p>
                </div>

                <div class="picker-card">
                  <span class="picker-label">Номер группы</span>
                  <div class="picker">
                    <input id="akvtSearchInput" type="text" placeholder="Например, ВЕБ-32 или ИСП-11" autocomplete="off" disabled>
                    <div class="picker-list" id="akvtPickerList"></div>
                  </div>
                </div>

                <div class="status-state" id="akvtLoadingState">
                  <div class="spinner"></div>
                  <div class="big">Загружаем расписание…</div>
                  <div>Синхронизация с сервером колледжа</div>
                </div>

                <div class="status-state error u-hide" id="akvtErrorState">
                  <div class="big">Не удалось загрузить расписание автоматически</div>
                  <div id="akvtErrorDetail">Расписание на эту неделю готовится к публикации.</div>
                  <a class="retry-link" id="akvtRetryBtn" style="cursor:pointer;">Попробовать ещё раз</a>
                </div>

                <div class="status-state u-hide" id="akvtEmptyState">
                  <div class="big">Пока ничего не выбрано</div>
                  <div>Начните вводить номер группы в поле выше</div>
                </div>

                <div id="akvtScheduleView" class="u-hide"></div>
                <div class="updated-note u-hide" id="akvtUpdatedNote"></div>

                <?php
                // Display any additional page content set by the editor in WordPress
                while (have_posts()): the_post();
                  $content = get_the_content();
                  if (!empty($content)):
                    echo '<div class="extra-files" style="margin-top:32px;">' . wpautop($content) . '</div>';
                  endif;
                endwhile;
                ?>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  var restUrl = '<?php echo esc_url(rest_url('akvt/v1/schedule')); ?>';
  var data = null;
  var selectedGroup = null;

  var searchInput = document.getElementById('akvtSearchInput');
  var pickerList = document.getElementById('akvtPickerList');
  var loadingState = document.getElementById('akvtLoadingState');
  var errorState = document.getElementById('akvtErrorState');
  var errorDetail = document.getElementById('akvtErrorDetail');
  var emptyState = document.getElementById('akvtEmptyState');
  var scheduleView = document.getElementById('akvtScheduleView');
  var updatedNote = document.getElementById('akvtUpdatedNote');
  var retryBtn = document.getElementById('akvtRetryBtn');

  var DAY_ORDER = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  var DAY_MAP = {1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг', 5: 'Пятница', 6: 'Суббота'};
  var todayName = DAY_MAP[new Date().getDay()] || '';

  function loadSchedule() {
    loadingState.classList.remove('u-hide');
    errorState.classList.add('u-hide');
    emptyState.classList.add('u-hide');
    scheduleView.classList.add('u-hide');

    fetch(restUrl)
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(json) {
        data = json;
        loadingState.classList.add('u-hide');
        searchInput.disabled = false;
        
        var groups = (data && data.groups) ? Object.keys(data.groups) : [];
        if (groups.length === 0) {
          errorDetail.textContent = 'Файл расписания пока не загружен в панель управления.';
          errorState.classList.remove('u-hide');
          return;
        }

        emptyState.classList.remove('u-hide');
        renderList('');

        // Restore last chosen group from localStorage
        var saved = localStorage.getItem('akvt_selected_group');
        if (saved && data.groups[saved]) {
          selectGroup(saved);
        }
      })
      .catch(function(err) {
        loadingState.classList.add('u-hide');
        errorState.classList.remove('u-hide');
        errorDetail.textContent = 'Ошибка загрузки данных: ' + err.message;
      });
  }

  function renderList(query) {
    if (!data || !data.groups) return;
    var q = (query || '').toLowerCase().trim();
    var groups = Object.keys(data.groups).sort();
    var filtered = groups.filter(function(g) { return g.toLowerCase().indexOf(q) !== -1; });

    pickerList.innerHTML = '';
    if (filtered.length === 0) {
      var item = document.createElement('div');
      item.className = 'picker-item';
      item.textContent = 'Группа не найдена';
      item.style.color = 'var(--muted)';
      pickerList.appendChild(item);
    } else {
      filtered.forEach(function(g) {
        var item = document.createElement('div');
        item.className = 'picker-item' + (g === selectedGroup ? ' active' : '');
        item.textContent = g;
        item.addEventListener('click', function() { selectGroup(g); });
        pickerList.appendChild(item);
      });
    }
    pickerList.classList.add('open');
  }

  function selectGroup(g) {
    selectedGroup = g;
    searchInput.value = g;
    pickerList.classList.remove('open');
    emptyState.classList.add('u-hide');
    scheduleView.classList.remove('u-hide');
    localStorage.setItem('akvt_selected_group', g);
    renderSchedule(g);
  }

  function renderSchedule(groupName) {
    scheduleView.innerHTML = '';
    var sched = (data.groups && data.groups[groupName]) || {};

    DAY_ORDER.forEach(function(day) {
      var lessons = sched[day] || [];
      var isToday = (day === todayName);
      var dayEl = document.createElement('div');
      dayEl.className = 'day' + (isToday ? ' today' : '');
      if (isToday) dayEl.classList.add('open');

      var count = lessons.length;
      var toggle = document.createElement('button');
      toggle.className = 'day-toggle';
      toggle.type = 'button';
      toggle.innerHTML = '<span class="dname">' + day + (isToday ? '<span class="today-tag">сегодня</span>' : '') + '</span>' +
        '<span class="meta"><span>' + (count ? count + ' ' + pairsWord(count) : 'выходной') + '</span><span class="chev"></span></span>';
      
      toggle.addEventListener('click', function() { dayEl.classList.toggle('open'); });
      dayEl.appendChild(toggle);

      var lessonsWrap = document.createElement('div');
      lessonsWrap.className = 'lessons';

      if (lessons.length === 0) {
        lessonsWrap.innerHTML = '<div class="day-empty">Пар нет — свободный день</div>';
      } else {
        lessons.forEach(function(l) {
          var row = document.createElement('div');
          row.className = 'lesson';
          var sub = [l.teacher, l.room].filter(Boolean).join(' · ');
          row.innerHTML = '<div class="time">' + escapeHtml(l.pair || '—') + '</div>' +
            '<div class="info">' +
            '<div class="subject">' + escapeHtml(l.subject || '—') + '</div>' +
            '<div class="subline">' + escapeHtml(sub) + '</div>' +
            (l.note ? '<div class="note">' + escapeHtml(l.note) + '</div>' : '') +
            '</div>';
          lessonsWrap.appendChild(row);
        });
      }

      dayEl.appendChild(lessonsWrap);
      scheduleView.appendChild(dayEl);
    });

    if (data.updated) {
      updatedNote.textContent = 'Обновлено: ' + data.updated;
      updatedNote.classList.remove('u-hide');
    }
  }

  function pairsWord(n) {
    var mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'пара';
    if ([2, 3, 4].indexOf(mod10) !== -1 && [12, 13, 14].indexOf(mod100) === -1) return 'пары';
    return 'пар';
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  if (searchInput) {
    searchInput.addEventListener('input', function(e) { renderList(e.target.value); });
    searchInput.addEventListener('focus', function(e) { renderList(e.target.value); });
  }

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.picker')) {
      pickerList.classList.remove('open');
    }
  });

  if (retryBtn) {
    retryBtn.addEventListener('click', loadSchedule);
  }

  loadSchedule();
})();
</script>

<?php get_footer(); ?>
