<?php
if (!defined('ABSPATH')) exit;

get_header();
?>

<div id="tape-wrap">
  <div class="wrap title">
    <?php akvt_breadcrumbs(); ?>
  </div>
</div>

<div class="wrap above">
  <div id="primary_single" style="flex: 1 1 0%; min-width: 0;">
    <div id="content_single" role="main">
      <?php while (have_posts()) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <div id="navigation_cap_article" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; font-size:0.85rem; color:var(--muted);">
            <div id="date">
              <span class="sep">Опубликовано: </span>
              <time class="entry-date" datetime="<?php echo get_the_date('c'); ?>"><?php echo get_the_date('d.m.Y'); ?></time>
            </div>
            <nav id="nav-single">
              <?php previous_post_link('%link', '← Предыдущая'); ?>
              <span class="sep"> · </span>
              <?php next_post_link('%link', 'Следующая →'); ?>
            </nav>
          </div>

          <header class="entry-header">
            <h1 class="entry-title"><?php the_title(); ?></h1>
          </header>

          <?php if (has_post_thumbnail()): ?>
            <div class="entry-featured-image" style="margin: 20px 0;">
              <?php the_post_thumbnail('large', ['style' => 'width:100%; height:auto; border-radius:12px;']); ?>
            </div>
          <?php endif; ?>

          <div class="entry-content">
            <?php the_content(); ?>
          </div>

          <footer class="entry-meta" style="margin-top:28px; padding-top:14px; border-top:1px solid var(--line-soft); font-size:0.88rem; color:var(--muted);">
            Пресс-служба АКВТ
            <?php
            $cats = get_the_category();
            if (!empty($cats)) {
                echo '<span class="sep"> · Рубрика: </span>';
                the_category(', ');
            }
            ?>
          </footer>
        </article>
      <?php endwhile; ?>
    </div>
  </div>

  <?php if (is_active_sidebar('sidebar-primary')): ?>
    <div id="secondary_page" class="widget-area" role="complementary">
      <?php dynamic_sidebar('sidebar-primary'); ?>
    </div>
  <?php endif; ?>
</div>

<?php
get_footer();
