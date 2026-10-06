<?php
if (!defined('ABSPATH')) exit;

/**
 * Журнал изменений и аудит действий пользователей (Audit Trail)
 */

function akvt_log_action($action, $object_name, $details = '') {
    $user = wp_get_current_user();
    $user_name = $user->exists() ? $user->display_name . ' (' . $user->user_login . ')' : 'Система / Cron';

    $log_entry = [
        'time'     => current_time('mysql'),
        'user'     => $user_name,
        'action'   => $action,
        'object'   => $object_name,
        'details'  => $details,
        'ip'       => isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '127.0.0.1'
    ];

    $log = get_option('akvt_audit_log', []);
    if (!is_array($log)) $log = [];

    // Добавляем запись в начало
    array_unshift($log, $log_entry);

    // Храним последние 200 записей
    if (count($log) > 200) {
        $log = array_slice($log, 0, 200);
    }

    update_option('akvt_audit_log', $log, false);
}

// Отслеживание сохранения записей
add_action('save_post', function ($post_id, $post, $update) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;
    if (in_array($post->post_type, ['nav_menu_item', 'revision'])) return;

    $action = $update ? 'Обновление' : 'Создание';
    $type_obj = get_post_type_object($post->post_type);
    $type_label = $type_obj ? $type_obj->labels->singular_name : $post->post_type;

    akvt_log_action(
        $action . ' материала',
        "[$type_label] {$post->post_title}",
        "Статус: {$post->post_status}"
    );
}, 10, 3);

// Отслеживание удаления в корзину
add_action('wp_trash_post', function ($post_id) {
    $post = get_post($post_id);
    if ($post) {
        akvt_log_action('Перемещение в корзину', "[{$post->post_type}] {$post->post_title}");
    }
});

// Отслеживание обновления глобальных настроек
add_action('update_option_akvt_options', function ($old_val, $new_val) {
    akvt_log_action('Изменение настроек АКВТ', 'Глобальные настройки (Шапка, Главная, Контакты или Подвал)');
}, 10, 2);

// Меню в админке
function akvt_audit_log_menu() {
    add_management_page(
        'Журнал изменений АКВТ',
        'Журнал изменений',
        'edit_posts',
        'akvt-audit-log',
        'akvt_render_audit_log_page'
    );
}
add_action('admin_menu', 'akvt_audit_log_menu');

function akvt_render_audit_log_page() {
    $log = get_option('akvt_audit_log', []);
    ?>
    <div class="wrap" style="max-width: 1100px;">
        <h1><span class="dashicons dashicons-backup"></span> Журнал действий и аудит изменений</h1>
        <p class="description">Фиксация всех правок контента: кто, когда и что изменил на сайте колледжа.</p>

        <table class="wp-list-table widefat fixed striped" style="margin-top:16px;">
            <thead>
                <tr>
                    <th style="width:160px;">Дата и время</th>
                    <th style="width:200px;">Сотрудник</th>
                    <th style="width:180px;">Действие</th>
                    <th>Объект / Изменение</th>
                    <th style="width:120px;">IP-адрес</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($log)): ?>
                    <tr><td colspan="5" style="text-align:center; padding:20px;">Журнал пока пуст. Записи появятся при первом редактировании сайта.</td></tr>
                <?php else: ?>
                    <?php foreach ($log as $item): ?>
                        <tr>
                            <td><code><?php echo esc_html($item['time']); ?></code></td>
                            <td><strong><?php echo esc_html($item['user']); ?></strong></td>
                            <td><span class="badge" style="background:#e8edfb; color:#1e3f9e; padding:3px 8px; border-radius:4px; font-weight:600; font-size:12px;"><?php echo esc_html($item['action']); ?></span></td>
                            <td>
                                <div><?php echo esc_html($item['object']); ?></div>
                                <?php if (!empty($item['details'])): ?>
                                    <small style="color:#64748b;"><?php echo esc_html($item['details']); ?></small>
                                <?php endif; ?>
                            </td>
                            <td><small><?php echo esc_html($item['ip']); ?></small></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}
