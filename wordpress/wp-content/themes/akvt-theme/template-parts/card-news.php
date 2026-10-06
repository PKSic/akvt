<?php
if (!defined('ABSPATH')) exit;
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('news-card'); ?>>
  <?php if (has_post_thumbnail()): ?>
    <div class="news-thumb">
      <a href="<?php the_permalink(); ?>">
        <?php the_post_thumbnail('akvt-card', ['loading' => 'lazy', 'alt' => get_the_title()]); ?>
      </a>
    </div>
  <?php endif; ?>

  <div class="news-body">
    <div class="news-meta">
      <time datetime="<?php echo get_the_date('c'); ?>"><?php echo get_the_date('d.m.Y'); ?></time>
      <?php
      $cats = get_the_category();
      if (!empty($cats)) {
          echo '<span class="sep">·</span><span>' . esc_html($cats[0]->name) . '</span>';
      }
      ?>
    </div>
    <h3 class="news-title">
      <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
    </h3>
    <div class="news-excerpt">
      <?php echo wp_trim_words(get_the_excerpt(), 18, '...'); ?>
    </div>
  </div>
</article>
