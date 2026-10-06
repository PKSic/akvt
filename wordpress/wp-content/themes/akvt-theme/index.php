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
  <div class="section-head" style="margin-bottom: 24px;">
    <div class="eyebrow">ПРЕСС-СЛУЖБА</div>
    <h1><?php is_archive() ? the_archive_title() : 'Все новости колледжа'; ?></h1>
  </div>

  <?php if (have_posts()) : ?>
    <div class="news-grid">
      <?php while (have_posts()) : the_post(); ?>
        <?php get_template_part('template-parts/card', 'news'); ?>
      <?php endwhile; ?>
    </div>

    <div class="akvt-pagination" style="margin-top: 36px; text-align: center;">
      <?php
      echo paginate_links([
          'prev_text' => '← Назад',
          'next_text' => 'Вперёд →',
      ]);
      ?>
    </div>
  <?php else : ?>
    <p style="color:var(--muted);">Записей пока нет.</p>
  <?php endif; ?>
</div>

<?php
get_footer();
