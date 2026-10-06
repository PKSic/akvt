<?php
if (!defined('ABSPATH')) exit;

/**
 * Регистрация Custom Post Type: Фотогалереи мероприятий
 */
function akvt_register_gallery_cpt() {
    $labels = [
        'name'               => 'Фотогалереи',
        'singular_name'      => 'Фотогалерея',
        'menu_name'          => 'Галереи',
        'add_new'            => 'Создать фотогалерею',
        'add_new_item'       => 'Создать новую фотогалерею',
        'edit_item'          => 'Редактировать фотогалерею',
        'all_items'          => 'Все фотогалереи',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => 'galerei',
        'rewrite'            => ['slug' => 'galerei', 'with_front' => false],
        'menu_icon'          => 'dashicons-format-gallery',
        'supports'           => ['title', 'editor', 'thumbnail'],
        'show_in_rest'       => true,
    ];

    register_post_type('photo_gallery', $args);
}
add_action('init', 'akvt_register_gallery_cpt');

/**
 * Метабокс фотографий галереи
 */
function akvt_gallery_meta_box() {
    add_meta_box(
        'akvt_gallery_details',
        'Фотографии альбома и дата события',
        'akvt_render_gallery_meta_box',
        'photo_gallery',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'akvt_gallery_meta_box');

function akvt_render_gallery_meta_box($post) {
    wp_nonce_field('akvt_gallery_nonce_action', 'akvt_gallery_nonce');

    $event_date = get_post_meta($post->ID, '_akvt_gallery_date', true);
    $photos_raw = get_post_meta($post->ID, '_akvt_gallery_photos', true);
    ?>
    <div style="display:flex; flex-direction:column; gap:14px; margin-top:10px;">
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_gallery_date">Дата проведения мероприятия:</label>
            <input style="padding:8px 12px;" type="date" id="akvt_gallery_date" name="akvt_gallery_date" value="<?php echo esc_attr($event_date); ?>">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_gallery_photos">Ссылки на фотографии альбома (по одной на строке):</label>
            <textarea style="width:100%;height:140px;font-family:monospace;padding:8px;" id="akvt_gallery_photos" name="akvt_gallery_photos" placeholder="https://akvt.ru/wp-content/uploads/...jpg&#10;https://akvt.ru/wp-content/uploads/...jpg"><?php echo esc_textarea($photos_raw); ?></textarea>
            <p class="description">Вставьте URL фотографий, загруженных в Медиабиблиотеку. Каждая ссылка с новой строки.</p>
        </div>
    </div>
    <?php
}

function akvt_save_gallery_meta($post_id) {
    if (!isset($_POST['akvt_gallery_nonce']) || !wp_verify_nonce($_POST['akvt_gallery_nonce'], 'akvt_gallery_nonce_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['akvt_gallery_date'])) {
        update_post_meta($post_id, '_akvt_gallery_date', sanitize_text_field($_POST['akvt_gallery_date']));
    }
    if (isset($_POST['akvt_gallery_photos'])) {
        update_post_meta($post_id, '_akvt_gallery_photos', sanitize_textarea_field($_POST['akvt_gallery_photos']));
    }
}
add_action('save_post_photo_gallery', 'akvt_save_gallery_meta');
