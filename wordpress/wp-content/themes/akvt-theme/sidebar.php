<?php
/**
 * Sidebar Template (#side-navi)
 *
 * @package AKVT_Theme
 */

if (!defined('ABSPATH')) exit;
?>

<div id="side-navi" role="navigation" aria-label="Боковая навигация">
  <div>
    <?php
    if (has_nav_menu('side')) {
      wp_nav_menu([
        'theme_location' => 'side',
        'container'      => false,
        'items_wrap'     => '%3$s',
        'fallback_cb'    => false,
      ]);
    } else {
      // Dynamic page hierarchy for current parent section
      global $post;
      $ancestors = ($post && $post->ancestors) ? $post->ancestors : [];
      $root_id   = !empty($ancestors) ? end($ancestors) : ($post ? $post->ID : 0);

      if ($root_id) {
        $children = wp_list_pages([
          'title_li'    => '',
          'child_of'    => $root_id,
          'echo'        => 0,
          'sort_column' => 'menu_order, post_title',
        ]);

        if (!empty($children)) {
          echo $children;
        } else {
          // Fallback to top level pages
          wp_list_pages([
            'title_li'    => '',
            'depth'       => 1,
            'sort_column' => 'menu_order, post_title',
          ]);
        }
      }
    }
    ?>
  </div>
</div>
