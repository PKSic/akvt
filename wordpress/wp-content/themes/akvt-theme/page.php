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
  <div id="primary_page">
    <div id="content_page" role="main">
      <?php while (have_posts()) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <header class="entry-header">
            <h1 class="entry-title"><?php the_title(); ?></h1>
          </header>

          <div class="entry-content">
            <?php the_content(); ?>
          </div>
        </article>
      <?php endwhile; ?>
    </div>
  </div>

  <?php
  // Автоматические подразделы страницы в виде адаптивных чипсов
  global $post;
  $children = get_pages([
      'child_of'    => $post->post_parent ? $post->post_parent : $post->ID,
      'parent'      => $post->post_parent ? $post->post_parent : $post->ID,
      'sort_column' => 'menu_order'
  ]);

  if (!empty($children)) : ?>
    <div id="side-navi">
      <div>
        <?php foreach ($children as $child): ?>
          <li class="page_item <?php echo $child->ID === $post->ID ? 'current_page_item' : ''; ?>">
            <a href="<?php echo esc_url(get_permalink($child->ID)); ?>">
              <?php echo esc_html($child->post_title); ?>
            </a>
          </li>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>

  <?php if (is_active_sidebar('sidebar-primary')): ?>
    <div id="secondary_page" class="widget-area" role="complementary">
      <?php dynamic_sidebar('sidebar-primary'); ?>
    </div>
  <?php endif; ?>
</div>

<?php
get_footer();
