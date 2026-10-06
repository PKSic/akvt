<?php
if (!defined('ABSPATH')) exit;

get_header();

$eyebrow    = akvt_get_option('hero_eyebrow', 'ГБПОУ АО · АСТРАХАНЬ · С 1992 ГОДА');
$title      = akvt_get_option('hero_title', 'Территория успеха в мире информационных технологий');
$subtitle   = akvt_get_option('hero_subtitle', 'Астраханский колледж вычислительной техники — современное образование в сфере IT.');
$btn1_text  = akvt_get_option('hero_btn_primary', 'Поступить в АКВТ');
$btn1_link  = akvt_get_option('hero_btn_primary_link', '/postupayushhim/priemnaya-kampaniya-2026/');
$btn2_text  = akvt_get_option('hero_btn_sec', 'Как добраться');
$btn2_link  = akvt_get_option('hero_btn_sec_link', '/shema-proezda/');
$banner_on  = akvt_get_option('header_year_banner', '1');
?>

<!-- 1. Первый экран (Hero) -->
<section class="hero" aria-labelledby="heroTitle">
  <div class="wrap">
    <?php if ($banner_on === '1'): ?>
      <div class="year-banner-wrap" style="text-align:center; margin-bottom: 24px;">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/banner-2026.png'); ?>" alt="2026 — Год единства народов России" style="max-height: 80px; margin: 0 auto; display: inline-block;" onerror="this.style.display='none'">
      </div>
    <?php endif; ?>

    <div class="hero-grid">
      <div class="hero-content">
        <div class="eyebrow"><?php echo esc_html($eyebrow); ?></div>
        <h1 id="heroTitle" class="display-title"><?php echo esc_html($title); ?></h1>
        <p class="hero-lead"><?php echo esc_html($subtitle); ?></p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="<?php echo esc_url(home_url($btn1_link)); ?>">
            <?php echo esc_html($btn1_text); ?> <span class="arr">→</span>
          </a>
          <a class="btn btn-ghost" href="<?php echo esc_url(home_url($btn2_link)); ?>">
            <?php echo esc_html($btn2_text); ?>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 2. Блок статистики -->
<section class="stats-band" aria-label="АКВТ в цифрах">
  <div class="wrap stats-grid">
    <?php for ($i = 1; $i <= 4; $i++): ?>
      <div class="stat-card">
        <div class="stat-num"><?php echo esc_html(akvt_get_option("stat_{$i}_val")); ?></div>
        <div class="stat-label"><?php echo esc_html(akvt_get_option("stat_{$i}_lbl")); ?></div>
      </div>
    <?php endfor; ?>
  </div>
</section>

<!-- 3. Bento-навигация по ключевым направлениям -->
<section class="section-pad" aria-label="Быстрый переход">
  <div class="wrap bento-grid">
    <a class="bento-card bento-spec" href="<?php echo esc_url(home_url('/speczialnosti/')); ?>">
      <div class="bento-tag">ПРОФЕССИИ БУДУЩЕГО</div>
      <h3>Реализуемые специальности</h3>
      <p>Программирование, кибербезопасность, сетевое администрирование, дизайн и радиоэлектроника.</p>
      <span class="link-arrow">Каталог программ <span class="arr">→</span></span>
    </a>

    <a class="bento-card bento-apply" href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>">
      <div class="bento-tag">АБИТУРИЕНТАМ</div>
      <h3>Приёмная кампания 2026</h3>
      <p>Сроки подачи заявлений, бюджетные места, перечень документов и онлайн-подача.</p>
      <span class="link-arrow">Всё о поступлении <span class="arr">→</span></span>
    </a>

    <a class="bento-card bento-itcube" href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/czentr-czifrovogo-obrazovaniya-detej-it-kub/')); ?>">
      <div class="bento-tag">ИННОВАЦИИ</div>
      <h3>Центр «IT-куб»</h3>
      <p>Бесплатное обучение программированию, мобильной разработке и робототехнике для школьников.</p>
      <span class="link-arrow">О центре <span class="arr">→</span></span>
    </a>

    <a class="bento-card bento-student" href="<?php echo esc_url(home_url('/students/')); ?>">
      <div class="bento-tag">СТУДЕНЧЕСТВО</div>
      <h3>Студенческая жизнь</h3>
      <p>Стипендии, практика, чемпионаты «Профессионалы», общежитие и спортивные секции.</p>
      <span class="link-arrow">Подробнее <span class="arr">→</span></span>
    </a>
  </div>
</section>

<!-- 4. Лента актуальных новостей -->
<section class="section-pad news-section" aria-labelledby="newsHead">
  <div class="wrap">
    <div class="section-head" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;">
      <div>
        <div class="eyebrow">ПРЕСС-СЛУЖБА АКВТ</div>
        <h2 id="newsHead" style="margin:0;">События и новости</h2>
      </div>
      <a class="link-arrow" href="<?php echo esc_url(home_url('/archives/')); ?>">Все новости <span class="arr">→</span></a>
    </div>

    <div class="news-grid">
      <?php
      $news_query = new WP_Query([
          'post_type'      => 'post',
          'posts_per_page' => 6,
          'post_status'    => 'publish',
      ]);

      if ($news_query->have_posts()) :
          while ($news_query->have_posts()) : $news_query->the_post();
              get_template_part('template-parts/card', 'news');
          endwhile;
          wp_reset_postdata();
      else :
          echo '<p style="color:var(--muted);">Новости готовятся к публикации.</p>';
      endif;
      ?>
    </div>
  </div>
</section>

<?php
get_footer();
