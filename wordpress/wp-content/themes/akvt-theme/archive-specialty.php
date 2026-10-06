<?php
if (!defined('ABSPATH')) exit;

get_header();
?>

<div id="tape-wrap">
  <div class="wrap title">
    <?php akvt_breadcrumbs(); ?>
  </div>
</div>

<div class="wrap" style="padding-top: 24px; padding-bottom: 48px;">
  <div class="section-head" style="margin-bottom: 28px;">
    <div class="eyebrow">ПРИЁМНАЯ КАМПАНИЯ 2026</div>
    <h1>Реализуемые специальности</h1>
    <p class="hero-lead" style="max-width: 800px; margin-top: 8px;">
      Астраханский колледж вычислительной техники ведёт подготовку квалифицированных специалистов среднего звена по самым востребованным направлениям цифровой экономики.
    </p>
  </div>

  <?php if (have_posts()) : ?>
    <div class="akvt-spec-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 24px;">
      <?php while (have_posts()) : the_post(); ?>
        <?php get_template_part('template-parts/card', 'specialty'); ?>
      <?php endwhile; ?>
    </div>
  <?php else : ?>
    <p style="color:var(--muted);">Список специальностей обновляется.</p>
  <?php endif; ?>
</div>

<?php
get_footer();
