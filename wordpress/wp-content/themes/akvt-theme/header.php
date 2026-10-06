<?php
if (!defined('ABSPATH')) exit;

$ticker_active = function_exists('akvt_get_option') ? akvt_get_option('header_ticker_active', '1') : '1';
$ticker_text   = function_exists('akvt_get_option') ? akvt_get_option('header_ticker_text', '') : '';
$slogan        = function_exists('akvt_get_option') ? akvt_get_option('header_slogan', 'ТЕРРИТОРИЯ УСПЕХА') : 'ТЕРРИТОРИЯ УСПЕХА';
$cta_text      = function_exists('akvt_get_option') ? akvt_get_option('header_cta_text', 'Поступить') : 'Поступить';
$cta_link      = function_exists('akvt_get_option') ? akvt_get_option('header_cta_link', '/postupayushhim/priemnaya-kampaniya-2026/') : '/postupayushhim/priemnaya-kampaniya-2026/';
$year_banner   = function_exists('akvt_get_option') ? akvt_get_option('header_year_banner', '1') : '1';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link" href="#primary_page">Перейти к основному содержимому</a>

<!-- Верхняя информационная бегущая строка -->
<?php if ($ticker_active === '1' && !empty($ticker_text)) : ?>
<div class="hp-top" role="region" aria-label="Объявления">
  <div class="ticker">
    <span><?php echo esc_html($ticker_text); ?></span>
    <span><?php echo esc_html($ticker_text); ?></span>
  </div>
</div>
<?php endif; ?>

<!-- Основная шапка -->
<header class="hp-header" role="banner">
  <div class="wrap hp-nav">
    <a class="hp-brand" href="<?php echo esc_url(home_url('/')); ?>" rel="home">
      <span class="hp-logo">АКВТ</span>
      <span class="hp-divider" aria-hidden="true"></span>
      <span class="hp-slogan"><?php echo esc_html($slogan); ?></span>
    </a>

    <nav class="hp-menu" aria-label="Основная навигация">
      <div class="has-drop">
        <a href="<?php echo esc_url(home_url('/postupayushhim/')); ?>">Поступающим <span class="caret">▾</span></a>
        <div class="mega-panel">
          <a href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>">Приёмная кампания 2026</a>
          <a href="<?php echo esc_url(home_url('/speczialnosti/')); ?>">Реализуемые специальности</a>
          <a href="<?php echo esc_url(home_url('/postupayushhim/pravila-priema/')); ?>">Правила приёма</a>
          <a href="<?php echo esc_url(home_url('/postupayushhim/kontrolnye-cifry-priema/')); ?>">Контрольные цифры приёма</a>
          <a href="<?php echo esc_url(home_url('/postupayushhim/obshhezhitie/')); ?>">Общежитие</a>
          <a href="<?php echo esc_url(home_url('/postupayushhim/czelevoe-obuchenie/')); ?>">Целевое обучение</a>
          <a href="<?php echo esc_url(home_url('/shema-proezda/')); ?>">Схема проезда</a>
          <div class="mega-foot">
            <a class="link-arrow" href="<?php echo esc_url(home_url('/postupayushhim/')); ?>">Все материалы для поступающих <span class="arr">→</span></a>
          </div>
        </div>
      </div>

      <div class="has-drop">
        <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/')); ?>">Сведения <span class="caret">▾</span></a>
        <div class="mega-panel">
          <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/osnovnye-svedeniya-ob-obrazovatelnoj-organizaczii/')); ?>">Основные сведения</a>
          <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/administration/')); ?>">Руководство</a>
          <a href="<?php echo esc_url(home_url('/pedagogicheskij-sostav/')); ?>">Педагогический состав</a>
          <a href="<?php echo esc_url(home_url('/dokumenty/')); ?>">Документы</a>
          <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/obrazovanie/')); ?>">Образование</a>
          <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/czentr-czifrovogo-obrazovaniya-detej-it-kub/')); ?>">Центр «IT-куб»</a>
          <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/stipendii-i-inye-vidy-materialnoj-podderzhki/')); ?>">Стипендии и меры поддержки</a>
          <div class="mega-foot">
            <a class="link-arrow" href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/')); ?>">Все сведения об организации <span class="arr">→</span></a>
          </div>
        </div>
      </div>

      <a href="<?php echo esc_url(home_url('/students/')); ?>">Студентам</a>
      <a href="<?php echo esc_url(home_url('/teachers/')); ?>">Преподавателям</a>
      <a href="<?php echo esc_url(home_url('/parents/')); ?>">Родителям</a>
      <a href="<?php echo esc_url(home_url('/obrashheniya-grazhdan/')); ?>">Контакты</a>
    </nav>

    <a class="btn btn-primary hp-cta" href="<?php echo esc_url(home_url($cta_link)); ?>">
      <?php echo esc_html($cta_text); ?> <span class="arr">→</span>
    </a>

    <button class="hp-burger" type="button" aria-label="Меню" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<!-- Мобильное меню -->
<nav class="hp-mobile-nav" aria-label="Мобильное меню">
  <a class="m-parent" href="<?php echo esc_url(home_url('/postupayushhim/')); ?>">Поступающим <span class="caret">▾</span></a>
  <div class="m-sub">
    <a href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>">Приёмная кампания 2026</a>
    <a href="<?php echo esc_url(home_url('/speczialnosti/')); ?>">Реализуемые специальности</a>
    <a href="<?php echo esc_url(home_url('/postupayushhim/pravila-priema/')); ?>">Правила приёма</a>
    <a href="<?php echo esc_url(home_url('/postupayushhim/kontrolnye-cifry-priema/')); ?>">Контрольные цифры приёма</a>
    <a href="<?php echo esc_url(home_url('/postupayushhim/obshhezhitie/')); ?>">Общежитие</a>
    <a href="<?php echo esc_url(home_url('/shema-proezda/')); ?>">Схема проезда</a>
  </div>

  <a class="m-parent" href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/')); ?>">Сведения <span class="caret">▾</span></a>
  <div class="m-sub">
    <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/osnovnye-svedeniya-ob-obrazovatelnoj-organizaczii/')); ?>">Основные сведения</a>
    <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/administration/')); ?>">Руководство</a>
    <a href="<?php echo esc_url(home_url('/pedagogicheskij-sostav/')); ?>">Педагогический состав</a>
    <a href="<?php echo esc_url(home_url('/dokumenty/')); ?>">Документы</a>
    <a href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/czentr-czifrovogo-obrazovaniya-detej-it-kub/')); ?>">Центр «IT-куб»</a>
  </div>

  <a href="<?php echo esc_url(home_url('/students/')); ?>">Студентам</a>
  <a href="<?php echo esc_url(home_url('/teachers/')); ?>">Преподавателям</a>
  <a href="<?php echo esc_url(home_url('/parents/')); ?>">Родителям</a>
  <a href="<?php echo esc_url(home_url('/obrashheniya-grazhdan/')); ?>">Обращения граждан</a>
  <a href="http://sdo2.akvt.ru" target="_blank" rel="noopener">Образовательный портал ↗</a>
</nav>

<main id="main-content">
