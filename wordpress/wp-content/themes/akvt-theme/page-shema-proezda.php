<?php
/**
 * Template Name: Схема проезда и контакты корпусов
 * Template Post Type: page
 *
 * @package AKVT_Theme
 */

if (!defined('ABSPATH')) exit;

wp_enqueue_style('akvt-shema');

get_header();

// Fetch campus locations from CPT or fallback to defaults
$loc_query = new WP_Query([
  'post_type'      => 'campus_location',
  'posts_per_page' => -1,
  'orderby'        => 'menu_order',
  'order'          => 'ASC',
]);

$locations = [];

if ($loc_query->have_posts()) {
  while ($loc_query->have_posts()) {
    $loc_query->the_post();
    $coords_raw = get_post_meta(get_the_ID(), '_akvt_loc_coords', true) ?: '46.374500, 48.059800';
    $coords = array_map('trim', explode(',', $coords_raw));
    $locations[] = [
      'title'     => get_the_title(),
      'type'      => get_post_meta(get_the_ID(), '_akvt_loc_type', true) ?: 'Главный корпус',
      'address'   => get_post_meta(get_the_ID(), '_akvt_loc_address', true) ?: '',
      'phone'     => get_post_meta(get_the_ID(), '_akvt_loc_phone', true) ?: '',
      'email'     => get_post_meta(get_the_ID(), '_akvt_loc_email', true) ?: '',
      'hours'     => get_post_meta(get_the_ID(), '_akvt_loc_hours', true) ?: '',
      'transport' => get_post_meta(get_the_ID(), '_akvt_loc_transport', true) ?: '',
      'lat'       => floatval($coords[0] ?? 46.3745),
      'lon'       => floatval($coords[1] ?? 48.0598),
    ];
  }
  wp_reset_postdata();
}

if (empty($locations)) {
  // Default college locations
  $locations = [
    [
      'title'     => 'Главный корпус АКВТ',
      'type'      => 'Главный корпус',
      'address'   => 'пер. Смоляной, 2, Астрахань',
      'phone'     => '+7 (8512) 54-08-35',
      'email'     => 'office@akvt.astrobl.ru',
      'hours'     => 'Пн-Пт 8:30 - 17:00',
      'transport' => 'Автобусы: 4, 17, 37, 55, 60, 66; Маршрутки: 8, 20, 28, 35, 45, 74. Остановка «ул. Смоляная» / «Колледж вычислительной техники»',
      'lat'       => 46.374500,
      'lon'       => 48.059800,
    ],
    [
      'title'     => 'Учебный корпус №2',
      'type'      => 'Учебный корпус',
      'address'   => 'ул. Боевая, 66, Астрахань',
      'phone'     => '+7 (8512) 66-75-03',
      'email'     => 'priem@akvt.ru',
      'hours'     => 'Пн-Пт 8:30 - 16:30',
      'transport' => 'Автобусы: 19н, 25н, 30н. Остановка «Автогородок»',
      'lat'       => 46.329300,
      'lon'       => 48.020900,
    ],
    [
      'title'     => 'Общежитие АКВТ',
      'type'      => 'Общежитие',
      'address'   => 'ул. Ахшарумова, 80, Астрахань',
      'phone'     => '+7 (8512) 99-99-54',
      'email'     => 'dorm@akvt.ru',
      'hours'     => 'Круглосуточно',
      'transport' => 'Маршрутки: 1с, 14с, 89с. Остановка «ул. Ахшарумова»',
      'lat'       => 46.336800,
      'lon'       => 48.035100,
    ],
  ];
}
?>

<div id="main-content">
  <div id="main">
    <div id="tape-wrap">
      <div class="wrap title">
        <div class="breadcrumb">
          <span><a title="Перейти к АКВТ." href="<?php echo esc_url(home_url('/')); ?>" class="home">АКВТ</a></span>
          <span><span class="current-item"><?php the_title(); ?></span></span>
        </div>
      </div>
    </div>

    <div class="wrap above">
      <div id="primary_page" style="width:100%;">
        <div id="content_page" role="main">
          <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="entry-header">
              <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="entry-content">
              <div class="map-legend">
                <span class="map-legend-item"><span class="map-legend-dot main"></span> Главный корпус</span>
                <span class="map-legend-item"><span class="map-legend-dot edu"></span> Учебный корпус</span>
                <span class="map-legend-item"><span class="map-legend-dot dorm"></span> Общежитие</span>
              </div>

              <div class="map-layout">
                <div class="map-sidebar" id="locations-sidebar">
                  <div class="map-search">
                    <input type="text" id="map-search-input" placeholder="Поиск на карте..." />
                  </div>

                  <?php foreach ($locations as $i => $loc): ?>
                    <div class="location-card <?php echo $i === 0 ? 'active' : ''; ?>" data-lat="<?php echo esc_attr($loc['lat']); ?>" data-lon="<?php echo esc_attr($loc['lon']); ?>" data-idx="<?php echo esc_attr($i); ?>">
                      <span class="tag"><?php echo esc_html($loc['type']); ?></span>
                      <h3><?php echo esc_html($loc['title']); ?></h3>
                      <p class="address"><?php echo esc_html($loc['address']); ?></p>
                      <?php if (!empty($loc['phone'])): ?>
                        <p class="phone"><a href="tel:<?php echo esc_attr(preg_replace('/[^0-9+]/', '', $loc['phone'])); ?>"><?php echo esc_html($loc['phone']); ?></a></p>
                      <?php endif; ?>
                    </div>
                  <?php endforeach; ?>

                  <?php if (!empty($locations[0]['transport'])): ?>
                    <div class="transport-info">
                      <strong>Как добраться:</strong><br>
                      <?php echo nl2br(esc_html($locations[0]['transport'])); ?>
                    </div>
                  <?php endif; ?>
                </div>

                <div class="map-main">
                  <div id="map-container">
                    <div id="map" style="width:100%; height:540px; border-radius:12px;"></div>
                  </div>

                  <div class="route-panel" id="route-panel" style="display:none;">
                    <button class="close-route" onclick="closeRoute()">✕</button>
                    <h4>🗺️ Маршрут</h4>
                    <div class="route-info" id="route-info">Выберите место назначения на карте</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://api-maps.yandex.ru/2.1/?apikey=d5774a1f-71be-43f6-ac52-700dff94977d&lang=ru_RU" type="text/javascript"></script>
<script>
(function() {
  var locationsData = <?php echo json_encode($locations, JSON_UNESCAPED_UNICODE); ?>;
  var myMap = null;
  var placemarks = [];
  var activeIdx = 0;

  function initMap() {
    if (typeof ymaps === 'undefined') return;

    ymaps.ready(function() {
      myMap = new ymaps.Map('map', {
        center: [locationsData[0].lat, locationsData[0].lon],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      });

      locationsData.forEach(function(loc, idx) {
        var placemark = new ymaps.Placemark([loc.lat, loc.lon], {
          balloonContentHeader: '<strong>' + loc.title + '</strong>',
          balloonContentBody: '<p>' + loc.address + '</p>' + (loc.phone ? '<p>Тел.: ' + loc.phone + '</p>' : '') + (loc.hours ? '<p>Время: ' + loc.hours + '</p>' : ''),
          hintContent: loc.title
        }, {
          preset: idx === 0 ? 'islands#blueDotIcon' : (idx === 1 ? 'islands#orangeDotIcon' : 'islands#greenDotIcon')
        });

        placemark.events.add('click', function() {
          setActiveCard(idx);
        });

        myMap.geoObjects.add(placemark);
        placemarks.push(placemark);
      });

      // Bind card clicks
      var cards = document.querySelectorAll('.location-card');
      cards.forEach(function(card) {
        card.addEventListener('click', function() {
          var idx = parseInt(card.getAttribute('data-idx'), 10);
          setActiveCard(idx);
        });
      });

      // Search input filter
      var searchInput = document.getElementById('map-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          var q = e.target.value.toLowerCase().trim();
          cards.forEach(function(card, idx) {
            var text = card.textContent.toLowerCase();
            card.style.display = (text.indexOf(q) !== -1) ? '' : 'none';
          });
        });
      }
    });
  }

  function setActiveCard(idx) {
    activeIdx = idx;
    var cards = document.querySelectorAll('.location-card');
    cards.forEach(function(c, i) {
      if (i === idx) c.classList.add('active');
      else c.classList.remove('active');
    });

    if (myMap && placemarks[idx]) {
      myMap.panTo([locationsData[idx].lat, locationsData[idx].lon], {
        flying: true,
        duration: 800
      }).then(function() {
        placemarks[idx].balloon.open();
      });
    }
  }

  window.addEventListener('load', initMap);
})();
</script>

<?php get_footer(); ?>
