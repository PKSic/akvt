<?php
if (!defined('ABSPATH')) exit;

/**
 * Регистрация Custom Post Type: Специальности
 */
function akvt_register_specialty_cpt() {
    $labels = [
        'name'               => 'Специальности',
        'singular_name'      => 'Специальность',
        'menu_name'          => 'Специальности',
        'name_admin_bar'     => 'Специальность',
        'add_new'            => 'Добавить специальность',
        'add_new_item'       => 'Добавить новую специальность',
        'new_item'           => 'Новая специальность',
        'edit_item'          => 'Редактировать специальность',
        'view_item'          => 'Просмотреть специальность',
        'all_items'          => 'Все специальности',
        'search_items'       => 'Искать специальности',
        'not_found'          => 'Специальностей не найдено',
        'not_found_in_trash' => 'В корзине специальностей нет',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => 'speczialnosti',
        'rewrite'            => ['slug' => 'speczialnosti', 'with_front' => false],
        'menu_icon'          => 'dashicons-welcome-learn-more',
        'supports'           => ['title', 'editor', 'thumbnail', 'excerpt'],
        'show_in_rest'       => true,
    ];

    register_post_type('specialty', $args);

    // Таксономия: База поступления (9 / 11 классов)
    register_taxonomy('spec_base', 'specialty', [
        'labels' => [
            'name'          => 'База приёма',
            'singular_name' => 'База приёма',
            'search_items'  => 'Искать базы',
            'all_items'     => 'Все базы приёма',
            'edit_item'     => 'Редактировать базу',
            'update_item'   => 'Обновить базу',
            'add_new_item'  => 'Добавить базу приёма',
            'new_item_name' => 'Название базы приёма',
            'menu_name'     => 'Базы приёма',
        ],
        'hierarchical' => true,
        'show_ui'      => true,
        'show_in_rest' => true,
        'rewrite'      => ['slug' => 'baza-priema'],
    ]);
}
add_action('init', 'akvt_register_specialty_cpt');

/**
 * Метабокс параметров специальности
 */
function akvt_specialty_meta_box() {
    add_meta_box(
        'akvt_specialty_details',
        'Параметры специальности (КЦП, сроки, квалификация)',
        'akvt_render_specialty_meta_box',
        'specialty',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'akvt_specialty_meta_box');

function akvt_render_specialty_meta_box($post) {
    wp_nonce_field('akvt_specialty_nonce_action', 'akvt_specialty_nonce');

    $code          = get_post_meta($post->ID, '_akvt_spec_code', true);
    $qualification = get_post_meta($post->ID, '_akvt_spec_qualification', true);
    $duration      = get_post_meta($post->ID, '_akvt_spec_duration', true);
    $budget        = get_post_meta($post->ID, '_akvt_spec_budget', true);
    $commercial    = get_post_meta($post->ID, '_akvt_spec_commercial', true);
    $cost          = get_post_meta($post->ID, '_akvt_spec_cost', true);
    $curriculum    = get_post_meta($post->ID, '_akvt_spec_curriculum', true);
    $syllabus      = get_post_meta($post->ID, '_akvt_spec_syllabus', true);
    ?>
    <style>
        .akvt-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
        .akvt-meta-field label { display: block; font-weight: 600; margin-bottom: 4px; }
        .akvt-meta-field input { width: 100%; padding: 8px 12px; }
        .akvt-meta-full { grid-column: span 2; }
    </style>
    <div class="akvt-meta-grid">
        <div class="akvt-meta-field">
            <label for="akvt_spec_code">Код специальности (напр. 09.02.07):</label>
            <input type="text" id="akvt_spec_code" name="akvt_spec_code" value="<?php echo esc_attr($code); ?>" placeholder="09.02.07">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_qualification">Присваиваемая квалификация:</label>
            <input type="text" id="akvt_spec_qualification" name="akvt_spec_qualification" value="<?php echo esc_attr($qualification); ?>" placeholder="Техник-программист">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_duration">Срок обучения:</label>
            <input type="text" id="akvt_spec_duration" name="akvt_spec_duration" value="<?php echo esc_attr($duration); ?>" placeholder="3 года 10 месяцев">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_budget">Бюджетных мест (КЦП):</label>
            <input type="number" id="akvt_spec_budget" name="akvt_spec_budget" value="<?php echo esc_attr($budget); ?>" placeholder="25">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_commercial">Коммерческих мест:</label>
            <input type="number" id="akvt_spec_commercial" name="akvt_spec_commercial" value="<?php echo esc_attr($commercial); ?>" placeholder="15">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_cost">Стоимость обучения в год (руб.):</label>
            <input type="text" id="akvt_spec_cost" name="akvt_spec_cost" value="<?php echo esc_attr($cost); ?>" placeholder="65 000 руб./год">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_curriculum">Ссылка на учебный план (PDF):</label>
            <input type="text" id="akvt_spec_curriculum" name="akvt_spec_curriculum" value="<?php echo esc_attr($curriculum); ?>" placeholder="https://.../plan.pdf">
        </div>
        <div class="akvt-meta-field">
            <label for="akvt_spec_syllabus">Ссылка на рабочую программу (PDF):</label>
            <input type="text" id="akvt_spec_syllabus" name="akvt_spec_syllabus" value="<?php echo esc_attr($syllabus); ?>" placeholder="https://.../program.pdf">
        </div>
    </div>
    <?php
}

function akvt_save_specialty_meta($post_id) {
    if (!isset($_POST['akvt_specialty_nonce']) || !wp_verify_nonce($_POST['akvt_specialty_nonce'], 'akvt_specialty_nonce_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $fields = [
        'akvt_spec_code'          => '_akvt_spec_code',
        'akvt_spec_qualification' => '_akvt_spec_qualification',
        'akvt_spec_duration'      => '_akvt_spec_duration',
        'akvt_spec_budget'        => '_akvt_spec_budget',
        'akvt_spec_commercial'    => '_akvt_spec_commercial',
        'akvt_spec_cost'          => '_akvt_spec_cost',
        'akvt_spec_curriculum'    => '_akvt_spec_curriculum',
        'akvt_spec_syllabus'      => '_akvt_spec_syllabus',
    ];

    foreach ($fields as $input_name => $meta_key) {
        if (isset($_POST[$input_name])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$input_name]));
        }
    }
}
add_action('save_post_specialty', 'akvt_save_specialty_meta');
