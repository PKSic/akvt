<?php
if (!defined('ABSPATH')) exit;

/**
 * Модуль управления расписанием занятий АКВТ
 */

function akvt_schedule_admin_menu() {
    add_menu_page(
        'Расписание занятий',
        'Расписание',
        'edit_posts',
        'akvt-schedule',
        'akvt_render_schedule_admin_page',
        'dashicons-calendar-alt',
        25
    );
}
add_action('admin_menu', 'akvt_schedule_admin_menu');

function akvt_render_schedule_admin_page() {
    if (isset($_POST['akvt_schedule_save']) && check_admin_referer('akvt_schedule_action', 'akvt_schedule_nonce')) {
        if (isset($_POST['akvt_schedule_json'])) {
            update_option('akvt_schedule_json', wp_unslash($_POST['akvt_schedule_json']));
        }
        if (isset($_POST['akvt_schedule_week_title'])) {
            update_option('akvt_schedule_week_title', sanitize_text_field($_POST['akvt_schedule_week_title']));
        }
        if (isset($_POST['akvt_schedule_ext_link'])) {
            update_option('akvt_schedule_ext_link', sanitize_text_field($_POST['akvt_schedule_ext_link']));
        }
        echo '<div class="updated"><p>Расписание успешно обновлено!</p></div>';
    }

    $week_title = get_option('akvt_schedule_week_title', 'Текущая учебная неделя (1/2 числитель/знаменатель)');
    $ext_link   = get_option('akvt_schedule_ext_link', '');
    $json_data  = get_option('akvt_schedule_json', '');
    ?>
    <div class="wrap" style="max-width: 900px;">
        <h1><span class="dashicons dashicons-calendar-alt"></span> Управление расписанием занятий</h1>
        <p class="description">Учебная часть может загружать расписание на текущую неделю. Данные мгновенно отображаются у студентов и преподавателей.</p>

        <form method="post" action="" style="background:#fff; padding:24px; border-radius:10px; border:1px solid #dcd6ce; margin-top:16px;">
            <?php wp_nonce_field('akvt_schedule_action', 'akvt_schedule_nonce'); ?>

            <div style="margin-bottom:16px;">
                <label style="display:block; font-weight:600; margin-bottom:4px;">Название учебной недели / статус:</label>
                <input type="text" name="akvt_schedule_week_title" value="<?php echo esc_attr($week_title); ?>" class="large-text">
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block; font-weight:600; margin-bottom:4px;">Прямая ссылка на облачную папку с Excel-файлами (Яндекс.Диск / Облако):</label>
                <input type="url" name="akvt_schedule_ext_link" value="<?php echo esc_attr($ext_link); ?>" class="large-text" placeholder="https://disk.yandex.ru/d/...">
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block; font-weight:600; margin-bottom:4px;">Структурированные данные расписания (JSON парсера):</label>
                <textarea name="akvt_schedule_json" rows="12" class="large-text" style="font-family:monospace; font-size:13px;"><?php echo esc_textarea($json_data); ?></textarea>
                <p class="description">Данные в формате JSON для виджета быстрого поиска групп (АСУ, ВЕБ, СА, КС и др.).</p>
            </div>

            <?php submit_button('Опубликовать расписание', 'primary large', 'akvt_schedule_save'); ?>
        </form>
    </div>
    <?php
}

/**
 * REST API эндпоинт для виджета расписания
 * GET /wp-json/akvt/v1/schedule
 */
add_action('rest_api_init', function () {
    register_rest_route('akvt/v1', '/schedule', [
        'methods'             => 'GET',
        'callback'            => function() {
            $json = get_option('akvt_schedule_json', '[]');
            $decoded = json_decode($json, true);
            return rest_ensure_response([
                'success'    => true,
                'week_title' => get_option('akvt_schedule_week_title', ''),
                'ext_link'   => get_option('akvt_schedule_ext_link', ''),
                'data'       => $decoded ?: []
            ]);
        },
        'permission_callback' => '__return_true',
    ]);
});
