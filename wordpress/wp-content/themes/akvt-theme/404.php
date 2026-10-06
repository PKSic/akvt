<?php
/**
 * Template: 404 Not Found Page
 *
 * @package AKVT_Theme
 */

if (!defined('ABSPATH')) exit;

get_header();
?>

<div id="main-content">
  <div id="main">
    <div id="tape-wrap">
      <div class="wrap title">
        <div class="breadcrumb">
          <span><a title="Перейти к АКВТ." href="<?php echo esc_url(home_url('/')); ?>" class="home">АКВТ</a></span>
          <span><span class="current-item">Ошибка 404</span></span>
        </div>
      </div>
    </div>

    <div class="wrap above" style="padding:60px 20px 80px; text-align:center;">
      <div style="max-width:680px; margin:0 auto;">
        <div style="font-size: clamp(5rem, 15vw, 9rem); font-weight:900; line-height:1; color:var(--primary); opacity:0.85; margin-bottom:12px; letter-spacing:-2px;">
          404
        </div>
        <h1 style="font-size:clamp(1.5rem, 4vw, 2.2rem); margin-bottom:16px; color:var(--ink);">
          Страница не найдена
        </h1>
        <p style="font-size:1.05rem; color:var(--ink-soft); line-height:1.6; margin-bottom:32px;">
          К сожалению, запрашиваемая страница перемещена или удалена. Воспользуйтесь быстрым поиском или перейдите в один из ключевых разделов сайта колледжа:
        </p>

        <!-- Search Form -->
        <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" style="display:flex; max-width:480px; margin:0 auto 40px; gap:8px;">
          <input type="search" name="s" placeholder="Поиск по сайту колледжа..." style="flex:1; padding:12px 16px; border:1px solid var(--border); border-radius:8px; font-size:1rem; outline:none; font-family:inherit;" required />
          <button type="submit" class="btn btn-primary" style="padding:12px 24px; border:none; border-radius:8px; cursor:pointer;">Найти</button>
        </form>

        <!-- Quick Links Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; text-align:left;">
          <a href="<?php echo esc_url(home_url('/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            🏠 Главная страница
          </a>
          <a href="<?php echo esc_url(home_url('/speczialnosti/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            💻 Реализуемые специальности
          </a>
          <a href="<?php echo esc_url(home_url('/students/raspisanie-zanyatij/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            📅 Расписание занятий
          </a>
          <a href="<?php echo esc_url(home_url('/postupayushhim/priemnaya-kampaniya-2026/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            🎓 Приёмная кампания
          </a>
          <a href="<?php echo esc_url(home_url('/shema-proezda/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            🗺️ Схема проезда
          </a>
          <a href="<?php echo esc_url(home_url('/obrashheniya-grazhdan/')); ?>" style="display:block; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; text-decoration:none; color:var(--ink); font-weight:600; transition:all 0.2s;">
            ✉️ Контакты и обращения
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<?php get_footer(); ?>
