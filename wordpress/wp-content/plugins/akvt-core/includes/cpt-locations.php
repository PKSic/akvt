<?php
if (!defined('ABSPATH')) exit;

/**
 * Регистрация Custom Post Type: Корпуса и схема проезда
 */
function akvt_register_location_cpt() {
    $labels = [
        'name'               => 'Корпуса колледжа',
        'singular_name'      => 'Корпус',
        'menu_name'          => 'Корпуса и адреса',
        'add_new'            => 'Добавить корпус',
        'add_new_item'       => 'Добавить новый корпус',
        'edit_item'          => 'Редактировать корпус',
        'all_items'          => 'Все корпуса',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => 'shema-proezda',
        'rewrite'            => ['slug' => 'locations', 'with_front' => false],
        'menu_icon'          => 'dashicons-location-alt',
        'supports'           => ['title', 'editor', 'thumbnail'],
        'show_in_rest'       => true,
    ];

    register_post_type('campus_location', $args);
}
add_action('init', 'akvt_register_location_cpt');

/**
 * Метабокс адреса и координат корпуса
 */
function akvt_location_meta_box() {
    add_meta_box(
        'akvt_location_details',
        'Адрес, контакты и схема проезда корпуса',
        'akvt_render_location_meta_box',
        'campus_location',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'akvt_location_meta_box');

function akvt_render_location_meta_box($post) {
    wp_nonce_field('akvt_location_nonce_action', 'akvt_location_nonce');

    $type      = get_post_meta($post->ID, '_akvt_loc_type', true);
    $address   = get_post_meta($post->ID, '_akvt_loc_address', true);
    $phone     = get_post_meta($post->ID, '_akvt_loc_phone', true);
    $transport = get_post_meta($post->ID, '_akvt_loc_transport', true);
    ?>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:10px;">
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_loc_type">Тип объекта:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_loc_type" name="akvt_loc_type" value="<?php echo esc_attr($type); ?>" placeholder="ГЛАВНЫЙ КОРПУС / УЧЕБНЫЙ КОРПУС №2 / ОБЩЕЖИТИЕ">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_loc_phone">Контактный телефон:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_loc_phone" name="akvt_loc_phone" value="<?php echo esc_attr($phone); ?>" placeholder="Приемная: 54-08-35">
        </div>
        <div style="grid-column: span 2;">
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_loc_address">Фактический адрес:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_loc_address" name="akvt_loc_address" value="<?php echo esc_attr($address); ?>" placeholder="г. Астрахань, пер. Смоляной, д. 2">
        </div>
        <div style="grid-column: span 2;">
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_loc_transport">Маршруты общественного транспорта:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_loc_transport" name="akvt_loc_transport" value="<?php echo esc_attr($transport); ?>" placeholder="Автобусы: М1, М2, 19н; Маршрутки: 1с, 14с">
        </div>
    </div>
    <?php
}

function akvt_save_location_meta($post_id) {
    if (!isset($_POST['akvt_location_nonce']) || !wp_verify_nonce($_POST['akvt_location_nonce'], 'akvt_location_nonce_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['akvt_loc_type'])) update_post_meta($post_id, '_akvt_loc_type', sanitize_text_field($_POST['akvt_loc_type']));
    if (isset($_POST['akvt_loc_address'])) update_post_meta($post_id, '_akvt_loc_address', sanitize_text_field($_POST['akvt_loc_address']));
    if (isset($_POST['akvt_loc_phone'])) update_post_meta($post_id, '_akvt_loc_phone', sanitize_text_field($_POST['akvt_loc_phone']));
    if (isset($_POST['akvt_loc_transport'])) update_post_meta($post_id, '_akvt_loc_transport', sanitize_text_field($_POST['akvt_loc_transport']));
}
add_action('save_post_campus_location', 'akvt_save_location_meta');
