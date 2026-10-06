<?php
if (!defined('ABSPATH')) exit;

/**
 * Регистрация Custom Post Type: Сотрудники и преподаватели
 */
function akvt_register_staff_cpt() {
    $labels = [
        'name'               => 'Сотрудники',
        'singular_name'      => 'Сотрудник',
        'menu_name'          => 'Сотрудники',
        'add_new'            => 'Добавить сотрудника',
        'add_new_item'       => 'Добавить нового сотрудника',
        'edit_item'          => 'Редактировать сотрудника',
        'new_item'           => 'Новый сотрудник',
        'view_item'          => 'Просмотреть сотрудника',
        'all_items'          => 'Все сотрудники',
        'search_items'       => 'Искать сотрудников',
        'not_found'          => 'Сотрудников не найдено',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => 'pedagogicheskij-sostav',
        'rewrite'            => ['slug' => 'staff', 'with_front' => false],
        'menu_icon'          => 'dashicons-businessperson',
        'supports'           => ['title', 'editor', 'thumbnail'],
        'show_in_rest'       => true,
    ];

    register_post_type('staff_member', $args);

    // Таксономия: Отдел / Цикловая комиссия
    register_taxonomy('staff_department', 'staff_member', [
        'labels' => [
            'name'          => 'Отделы и комиссии',
            'singular_name' => 'Отдел',
            'menu_name'     => 'Отделы/Комиссии',
        ],
        'hierarchical' => true,
        'show_ui'      => true,
        'show_in_rest' => true,
        'rewrite'      => ['slug' => 'otdel'],
    ]);
}
add_action('init', 'akvt_register_staff_cpt');

/**
 * Метабокс карточки сотрудника
 */
function akvt_staff_meta_box() {
    add_meta_box(
        'akvt_staff_details',
        'Служебные контакты и квалификация сотрудника',
        'akvt_render_staff_meta_box',
        'staff_member',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'akvt_staff_meta_box');

function akvt_render_staff_meta_box($post) {
    wp_nonce_field('akvt_staff_nonce_action', 'akvt_staff_nonce');

    $role      = get_post_meta($post->ID, '_akvt_staff_role', true);
    $phone     = get_post_meta($post->ID, '_akvt_staff_phone', true);
    $email     = get_post_meta($post->ID, '_akvt_staff_email', true);
    $hours     = get_post_meta($post->ID, '_akvt_staff_hours', true);
    $education = get_post_meta($post->ID, '_akvt_staff_education', true);
    $order     = get_post_meta($post->ID, '_akvt_staff_order', true);
    ?>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px;">
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_role">Должность:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_staff_role" name="akvt_staff_role" value="<?php echo esc_attr($role); ?>" placeholder="Директор / Преподаватель спецдисциплин">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_order">Порядок отображения в списке (0, 1, 2...):</label>
            <input style="width:100%;padding:8px 12px;" type="number" id="akvt_staff_order" name="akvt_staff_order" value="<?php echo esc_attr($order ?: 0); ?>">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_phone">Рабочий телефон:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_staff_phone" name="akvt_staff_phone" value="<?php echo esc_attr($phone); ?>" placeholder="54-08-35">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_email">Электронная почта:</label>
            <input style="width:100%;padding:8px 12px;" type="email" id="akvt_staff_email" name="akvt_staff_email" value="<?php echo esc_attr($email); ?>" placeholder="akvt@astrobl.ru">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_hours">Приёмные часы / График консультаций:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_staff_hours" name="akvt_staff_hours" value="<?php echo esc_attr($hours); ?>" placeholder="Пн-Пт: 9:00 - 17:00">
        </div>
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_staff_education">Образование и категория:</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_staff_education" name="akvt_staff_education" value="<?php echo esc_attr($education); ?>" placeholder="Высшее, высшая категория">
        </div>
    </div>
    <?php
}

function akvt_save_staff_meta($post_id) {
    if (!isset($_POST['akvt_staff_nonce']) || !wp_verify_nonce($_POST['akvt_staff_nonce'], 'akvt_staff_nonce_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $fields = [
        'akvt_staff_role'      => '_akvt_staff_role',
        'akvt_staff_phone'     => '_akvt_staff_phone',
        'akvt_staff_email'     => '_akvt_staff_email',
        'akvt_staff_hours'     => '_akvt_staff_hours',
        'akvt_staff_education' => '_akvt_staff_education',
        'akvt_staff_order'     => '_akvt_staff_order',
    ];

    foreach ($fields as $input_name => $meta_key) {
        if (isset($_POST[$input_name])) {
            update_post_meta($post_id, $meta_key, sanitize_text_field($_POST[$input_name]));
        }
    }
}
add_action('save_post_staff_member', 'akvt_save_staff_meta');
