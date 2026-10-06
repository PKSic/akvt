<?php
if (!defined('ABSPATH')) exit;

/**
 * Настройка ролей пользователей АКВТ
 */

function akvt_setup_custom_roles() {
    // 1. Контент-менеджер (Пресс-служба)
    add_role('akvt_content_manager', 'Контент-менеджер (Пресс-служба)', [
        'read'                   => true,
        'edit_posts'             => true,
        'edit_others_posts'      => true,
        'publish_posts'          => true,
        'delete_posts'           => true,
        'edit_pages'             => true,
        'edit_others_pages'      => true,
        'publish_pages'          => true,
        'upload_files'           => true,
        'manage_categories'      => true,
    ]);

    // 2. Редактор (Учебная часть / Документы)
    add_role('akvt_editor', 'Редактор (Учебная часть)', [
        'read'                   => true,
        'edit_posts'             => true,
        'edit_others_posts'      => true,
        'publish_posts'          => true,
        'delete_posts'           => true,
        'edit_pages'             => true,
        'edit_others_pages'      => true,
        'publish_pages'          => true,
        'upload_files'           => true,
        'manage_categories'      => true,
    ]);

    // 3. Автор (Создание черновиков без прямой публикации)
    add_role('akvt_author', 'Автор материалов (Черновики)', [
        'read'                   => true,
        'edit_posts'             => true,
        'edit_others_posts'      => false,
        'publish_posts'          => false,
        'delete_posts'           => false,
        'upload_files'           => true,
    ]);
}
