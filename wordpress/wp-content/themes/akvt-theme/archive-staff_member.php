<?php
/**
 * Template: Staff Directory Archive (Руководство и педагогический состав)
 * Post Type: staff_member
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
          <span><a title="Сведения об организации" href="<?php echo esc_url(home_url('/osnovnye-svedeniya-2-2/')); ?>">Сведения об организации</a></span>
          <span><span class="current-item">Руководство и педагогический состав</span></span>
        </div>
      </div>
    </div>

    <div class="wrap above">
      <?php get_sidebar(); ?>

      <div id="primary_page">
        <div id="content_page" role="main">
          <article class="page type-page status-publish hentry">
            <header class="entry-header">
              <h1 class="entry-title">Руководство и педагогический состав</h1>
            </header>

            <div class="entry-content">
              <?php
              $departments = get_terms([
                'taxonomy'   => 'staff_department',
                'hide_empty' => true,
                'orderby'    => 'term_order',
                'order'      => 'ASC',
              ]);

              if (!empty($departments) && !is_wp_error($departments)):
                // Dept jump links
                ?>
                <div class="akvt-dept-nav" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px;">
                  <?php foreach ($departments as $dept): ?>
                    <a href="#dept-<?php echo esc_attr($dept->slug); ?>" class="akvt-chip" style="display:inline-block; padding:6px 14px; background:var(--bg-card); border:1px solid var(--border); border-radius:20px; font-size:0.85rem; color:var(--ink-soft); text-decoration:none; transition:all 0.2s;">
                      <?php echo esc_html($dept->name); ?> (<?php echo esc_html($dept->count); ?>)
                    </a>
                  <?php endforeach; ?>
                </div>

                <?php
                foreach ($departments as $dept):
                  $dept_query = new WP_Query([
                    'post_type'      => 'staff_member',
                    'posts_per_page' => -1,
                    'tax_query'      => [
                      [
                        'taxonomy' => 'staff_department',
                        'field'    => 'term_id',
                        'terms'    => $dept->term_id,
                      ],
                    ],
                    'meta_key'       => '_akvt_staff_order',
                    'orderby'        => [
                      'meta_value_num' => 'ASC',
                      'title'          => 'ASC',
                    ],
                  ]);

                  if ($dept_query->have_posts()):
                    ?>
                    <h2 id="dept-<?php echo esc_attr($dept->slug); ?>" style="font-size:1.4rem; color:var(--primary); margin:28px 0 16px; border-bottom:2px solid var(--primary-light); padding-bottom:6px;">
                      <?php echo esc_html($dept->name); ?>
                    </h2>
                    <div class="akvt-staff-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; margin-bottom:32px;">
                      <?php
                      while ($dept_query->have_posts()): $dept_query->the_post();
                        get_template_part('template-parts/card', 'staff');
                      endwhile;
                      wp_reset_postdata();
                      ?>
                    </div>
                    <?php
                  endif;
                endforeach;

              else:
                // Fallback: query all staff without taxonomy grouping
                $staff_query = new WP_Query([
                  'post_type'      => 'staff_member',
                  'posts_per_page' => -1,
                  'meta_key'       => '_akvt_staff_order',
                  'orderby'        => [
                    'meta_value_num' => 'ASC',
                    'title'          => 'ASC',
                  ],
                ]);

                if ($staff_query->have_posts()):
                  ?>
                  <div class="akvt-staff-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
                    <?php
                    while ($staff_query->have_posts()): $staff_query->the_post();
                      get_template_part('template-parts/card', 'staff');
                    endwhile;
                    wp_reset_postdata();
                    ?>
                  </div>
                  <?php
                else:
                  ?>
                  <p style="color:var(--muted);">Информация о сотрудниках обновляется.</p>
                  <?php
                endif;
              endif;
              ?>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>

<?php get_footer(); ?>
