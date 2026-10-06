<?php
if (!defined('ABSPATH')) exit;

define('AKVT_THEME_VERSION', '2.0.0');

/**
 * Инициализация темы
 */
function akvt_theme_setup() {
    // Поддержка стандартных возможностей WordPress
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ]);
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script']);

    // Регистрация меню
    register_nav_menus([
        'primary-menu'    => 'Главное меню (Шапка)',
        'mobile-menu'     => 'Мобильное меню',
        'applicants-menu' => 'Меню: Поступающим',
        'students-menu'   => 'Меню: Студентам',
        'side'            => 'Боковое меню (Внутренние страницы)',
        'footer-menu'     => 'Меню подвала',
    ]);

    // Размеры миниатюр
    set_post_thumbnail_size(800, 450, true);
    add_image_size('akvt-card', 600, 360, true);
    add_image_size('akvt-square', 400, 400, true);
}
add_action('after_setup_theme', 'akvt_theme_setup');

/**
 * Подключение стилей и скриптов
 */
function akvt_enqueue_assets() {
    $theme_uri = get_template_directory_uri();

    // Шрифты Google Fonts
    wp_enqueue_style(
        'akvt-fonts',
        'https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&family=PT+Serif:ital,wght@0,400;0,600;1,400;1,600&display=swap',
        [],
        null
    );

    // Основные таблицы стилей (дизайн-система АКВТ)
    wp_enqueue_style('akvt-global', $theme_uri . '/assets/css/global.css', [], AKVT_THEME_VERSION);
    wp_enqueue_style('akvt-style', $theme_uri . '/assets/css/style.css', ['akvt-global'], AKVT_THEME_VERSION);
    wp_enqueue_style('akvt-adaptive', $theme_uri . '/assets/css/adaptive.css', ['akvt-style'], AKVT_THEME_VERSION);

    // Условные стили для модулей
    if (is_page('shema-proezda') || is_page_template('page-shema-proezda.php') || is_post_type_archive('campus_location')) {
        wp_enqueue_style('akvt-shema', $theme_uri . '/assets/css/shema-proezda.css', ['akvt-adaptive'], AKVT_THEME_VERSION);
    }
    if (is_page('raspisanie-zanyatij') || is_page_template('page-raspisanie.php')) {
        wp_enqueue_style('akvt-rasp', $theme_uri . '/assets/css/akvt-rasp.css', ['akvt-adaptive'], AKVT_THEME_VERSION);
        wp_enqueue_script('akvt-xlsx', $theme_uri . '/assets/js/xlsx.full.min.js', [], '0.18.5', true);
        wp_enqueue_script('akvt-rasp-widget', $theme_uri . '/assets/js/raspisanie-widget.mjs', ['akvt-xlsx'], AKVT_THEME_VERSION, true);
    }

    // Основной интерактивный скрипт (бургер, аккордеоны, модалки)
    wp_enqueue_script('akvt-main', $theme_uri . '/assets/js/main.js', ['jquery'], AKVT_THEME_VERSION, true);
}
add_action('wp_enqueue_scripts', 'akvt_enqueue_assets');

/**
 * Регистрация сайдбаров (Widget Areas)
 */
function akvt_widgets_init() {
    register_sidebar([
        'name'          => 'Боковая колонка страниц',
        'id'            => 'sidebar-primary',
        'description'   => 'Виджеты, отображаемые справа на обычных страницах',
        'before_widget' => '<aside id="%1$s" class="widget %2$s">',
        'after_widget'  => '</aside>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ]);
}
add_action('widgets_init', 'akvt_widgets_init');

/**
 * Хлебные крошки (Breadcrumbs)
 */
function akvt_breadcrumbs() {
    if (is_front_page()) return;

    echo '<div class="breadcrumb">';
    echo '<span><a href="' . esc_url(home_url('/')) . '" class="home">АКВТ</a></span>';

    if (is_singular('specialty')) {
        echo '<span><a href="' . esc_url(home_url('/speczialnosti/')) . '">Специальности</a></span>';
        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_singular('staff_member')) {
        echo '<span><a href="' . esc_url(home_url('/pedagogicheskij-sostav/')) . '">Сотрудники</a></span>';
        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_singular('post')) {
        echo '<span><a href="' . esc_url(home_url('/archives/')) . '">Новости</a></span>';
        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_page()) {
        global $post;
        if ($post->post_parent) {
            $parent_id = $post->post_parent;
            $parents = [];
            while ($parent_id) {
                $page = get_post($parent_id);
                $parents[] = '<span><a href="' . esc_url(get_permalink($page->ID)) . '">' . esc_html(get_the_title($page->ID)) . '</a></span>';
                $parent_id = $page->post_parent;
            }
            echo implode('', array_reverse($parents));
        }
        echo '<span>' . esc_html(get_the_title()) . '</span>';
    } elseif (is_archive()) {
        echo '<span>' . esc_html(post_type_archive_title('', false)) . '</span>';
    } elseif (is_search()) {
        echo '<span>Поиск: ' . esc_html(get_search_query()) . '</span>';
    } elseif (is_404()) {
        echo '<span>Страница не найдена</span>';
    }

    echo '</div>';
}
