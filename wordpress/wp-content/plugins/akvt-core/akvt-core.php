<?php
/**
 * Plugin Name: AKVT Core & Control Hub
 * Plugin URI: https://akvt.ru
 * Description: Ядро динамического портала АКВТ (Астраханский колледж вычислительной техники). Регистрирует Custom Post Types, таксономии, единый хаб настроек (шапка, подвал, главная), модуль расписания, аудит действий и удобную оболочку панели управления без правки кода.
 * Version: 2.0.0
 * Author: IT-служба АКВТ
 * Text Domain: akvt
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('AKVT_CORE_VERSION', '2.0.0');
define('AKVT_CORE_PATH', plugin_dir_path(__FILE__));
define('AKVT_CORE_URL', plugin_dir_url(__FILE__));

// Подключение модулей
require_once AKVT_CORE_PATH . 'includes/cpt-specialties.php';
require_once AKVT_CORE_PATH . 'includes/cpt-staff.php';
require_once AKVT_CORE_PATH . 'includes/cpt-documents.php';
require_once AKVT_CORE_PATH . 'includes/cpt-galleries.php';
require_once AKVT_CORE_PATH . 'includes/cpt-locations.php';
require_once AKVT_CORE_PATH . 'includes/settings-hub.php';
require_once AKVT_CORE_PATH . 'includes/schedule-module.php';
require_once AKVT_CORE_PATH . 'includes/security-sanitizer.php';
require_once AKVT_CORE_PATH . 'includes/audit-trail.php';
require_once AKVT_CORE_PATH . 'includes/roles.php';

// Административный интерфейс и Control Hub
if (is_admin()) {
    require_once AKVT_CORE_PATH . 'admin/control-hub.php';
}

/**
 * Активация плагина: сброс правил постоянных ссылок и создание ролей
 */
register_activation_hook(__FILE__, function() {
    akvt_register_specialty_cpt();
    akvt_register_staff_cpt();
    akvt_register_document_cpt();
    akvt_register_gallery_cpt();
    akvt_register_location_cpt();
    akvt_setup_custom_roles();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
