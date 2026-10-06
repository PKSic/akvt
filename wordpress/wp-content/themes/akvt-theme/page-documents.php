<?php
/**
 * Template Name: Документы колледжа
 * Template Post Type: page
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
          <?php if ($post->post_parent): ?>
            <span><a href="<?php echo esc_url(get_permalink($post->post_parent)); ?>"><?php echo esc_html(get_the_title($post->post_parent)); ?></a></span>
          <?php endif; ?>
          <span><span class="current-item"><?php the_title(); ?></span></span>
        </div>
      </div>
    </div>

    <div class="wrap above">
      <?php get_sidebar(); ?>

      <div id="primary_page">
        <div id="content_page" role="main">
          <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header class="entry-header">
              <h1 class="entry-title"><?php the_title(); ?></h1>
            </header>

            <div class="entry-content">
              <?php
              // Page content if any (e.g. introductory text)
              while (have_posts()): the_post();
                the_content();
              endwhile;
              ?>

              <!-- Interactive Document Filter -->
              <div class="akvt-doc-filter-wrap" style="margin:20px 0 24px; display:flex; flex-direction:column; gap:12px;">
                <div style="position:relative;">
                  <input type="text" id="akvtDocSearch" placeholder="Поиск по названию документа..." style="width:100%; padding:10px 14px; border:1px solid var(--border); border-radius:8px; font-size:0.95rem; font-family:inherit; outline:none; transition:border-color 0.2s;" onkeyup="filterDocs(this.value)" />
                </div>
              </div>

              <?php
              $categories = get_terms([
                'taxonomy'   => 'doc_category',
                'hide_empty' => true,
                'orderby'    => 'term_order',
                'order'      => 'ASC',
              ]);

              if (!empty($categories) && !is_wp_error($categories)):
                foreach ($categories as $cat):
                  $doc_query = new WP_Query([
                    'post_type'      => 'akvt_document',
                    'posts_per_page' => -1,
                    'tax_query'      => [
                      [
                        'taxonomy' => 'doc_category',
                        'field'    => 'term_id',
                        'terms'    => $cat->term_id,
                      ],
                    ],
                    'orderby'        => 'title',
                    'order'          => 'ASC',
                  ]);

                  if ($doc_query->have_posts()):
                    ?>
                    <h2 class="akvt-doc-section-title" style="font-size:1.25rem; color:var(--primary); margin:28px 0 12px; border-bottom:1px solid var(--border); padding-bottom:6px;">
                      <?php echo esc_html($cat->name); ?>
                    </h2>
                    <table class="akvt-doc-table" style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                      <tbody>
                        <?php
                        while ($doc_query->have_posts()): $doc_query->the_post();
                          get_template_part('template-parts/row', 'document');
                        endwhile;
                        wp_reset_postdata();
                        ?>
                      </tbody>
                    </table>
                    <?php
                  endif;
                endforeach;
              else:
                // Fallback: list all documents
                $all_docs = new WP_Query([
                  'post_type'      => 'akvt_document',
                  'posts_per_page' => -1,
                  'orderby'        => 'title',
                  'order'          => 'ASC',
                ]);

                if ($all_docs->have_posts()):
                  ?>
                  <table class="akvt-doc-table" style="width:100%; border-collapse:collapse;">
                    <tbody>
                      <?php
                      while ($all_docs->have_posts()): $all_docs->the_post();
                        get_template_part('template-parts/row', 'document');
                      endwhile;
                      wp_reset_postdata();
                      ?>
                    </tbody>
                  </table>
                  <?php
                endif;
              endif;
              ?>

              <div id="akvtDocNotFound" style="display:none; padding:20px; text-align:center; color:var(--muted); font-size:0.95rem;">
                Документы по вашему запросу не найдены.
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
function filterDocs(query) {
  var filter = query.toLowerCase().trim();
  var rows = document.querySelectorAll('.akvt-doc-row');
  var foundCount = 0;

  rows.forEach(function(row) {
    var text = row.querySelector('.akvt-doc-title').textContent.toLowerCase();
    if (text.indexOf(filter) !== -1) {
      row.style.display = '';
      foundCount++;
    } else {
      row.style.display = 'none';
    }
  });

  // Toggle category titles based on visible children
  document.querySelectorAll('.akvt-doc-section-title').forEach(function(title) {
    var nextTable = title.nextElementSibling;
    if (nextTable && nextTable.tagName === 'TABLE') {
      var visibleRows = nextTable.querySelectorAll('.akvt-doc-row:not([style*="display: none"])');
      title.style.display = visibleRows.length > 0 ? '' : 'none';
    }
  });

  var notFound = document.getElementById('akvtDocNotFound');
  if (notFound) {
    notFound.style.display = (foundCount === 0 && filter !== '') ? 'block' : 'none';
  }
}
</script>

<?php get_footer(); ?>
