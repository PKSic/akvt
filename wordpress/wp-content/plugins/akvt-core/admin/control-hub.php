<?php
if (!defined('ABSPATH')) exit;

/**
 * AKVT Control Hub — Единая управляющая оболочка поверх WordPress
 */

function akvt_control_hub_menu() {
    add_menu_page(
        'Панель управления АКВТ',
        'Панель АКВТ',
        'read',
        'akvt-hub',
        'akvt_render_control_hub',
        'dashicons-superhero-alt',
        2
    );
}
add_action('admin_menu', 'akvt_control_hub_menu');

function akvt_control_hub_assets($hook) {
    if (strpos($hook, 'akvt-hub') !== false || strpos($hook, 'akvt-settings') !== false) {
        wp_enqueue_style('akvt-hub-css', AKVT_CORE_URL . 'admin/control-hub.css', [], AKVT_CORE_VERSION);
        wp_enqueue_script('akvt-hub-js', AKVT_CORE_URL . 'admin/control-hub.js', ['jquery'], AKVT_CORE_VERSION, true);
    }
}
add_action('admin_enqueue_scripts', 'akvt_control_hub_assets');

function akvt_render_control_hub() {
    $news_count  = wp_count_posts('post')->publish;
    $spec_count  = wp_count_posts('specialty')->publish;
    $staff_count = wp_count_posts('staff_member')->publish;
    $docs_count  = wp_count_posts('akvt_document')->publish;
    $user        = wp_get_current_user();
    $site_url    = home_url('/');
    ?>
    <div class="akvt-hub-wrap">
        <!-- Верхний брендированный баннер -->
        <header class="akvt-hub-hero">
            <div class="akvt-hub-hero-info">
                <span class="akvt-hub-badge">ГБПОУ АО «АКВТ» · СИСТЕМА УПРАВЛЕНИЯ САЙТОМ</span>
                <h1>Панель управления порталом</h1>
                <p>Добро пожаловать, <strong><?php echo esc_html($user->display_name); ?></strong>! Управляйте содержимым сайта колледжа без изменения программного кода.</p>
            </div>
            <div class="akvt-hub-hero-actions">
                <button type="button" class="akvt-hub-btn akvt-hub-btn-preview" onclick="akvtOpenPreview('<?php echo esc_url($site_url); ?>')">
                    <span class="dashicons dashicons-smartphone"></span> Предпросмотр на сайте
                </button>
                <a href="<?php echo esc_url($site_url); ?>" target="_blank" class="akvt-hub-btn akvt-hub-btn-site">
                    <span class="dashicons dashicons-external"></span> Открыть сайт
                </a>
            </div>
        </header>

        <!-- Быстрые счётчики -->
        <div class="akvt-hub-metrics">
            <div class="akvt-metric-card">
                <div class="akvt-metric-num"><?php echo esc_html($news_count); ?></div>
                <div class="akvt-metric-label">Новостей и событий</div>
            </div>
            <div class="akvt-metric-card">
                <div class="akvt-metric-num"><?php echo esc_html($spec_count); ?></div>
                <div class="akvt-metric-label">Специальностей</div>
            </div>
            <div class="akvt-metric-card">
                <div class="akvt-metric-num"><?php echo esc_html($staff_count); ?></div>
                <div class="akvt-metric-label">Сотрудников и педагогов</div>
            </div>
            <div class="akvt-metric-card">
                <div class="akvt-metric-num"><?php echo esc_html($docs_count); ?></div>
                <div class="akvt-metric-label">Документов и приказов</div>
            </div>
        </div>

        <!-- Сетка основных разделов -->
        <div class="akvt-hub-grid">
            <!-- 1. Пресс-служба -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-megaphone"></span>
                    <h2>Пресс-служба и медиа</h2>
                </div>
                <p>Публикация новостей колледжа, добавление фоторепортажей и фотогалерей.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('post-new.php'); ?>" class="akvt-btn-primary">+ Написать новость</a>
                    <a href="<?php echo admin_url('edit.php'); ?>">Все новости</a>
                    <a href="<?php echo admin_url('edit.php?post_type=photo_gallery'); ?>">Фотогалереи событий</a>
                    <a href="<?php echo admin_url('upload.php'); ?>">Медиабиблиотека</a>
                </div>
            </div>

            <!-- 2. Расписание -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-calendar-alt"></span>
                    <h2>Расписание занятий</h2>
                </div>
                <p>Еженедельное обновление расписания для студентов и преподавателей.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('admin.php?page=akvt-schedule'); ?>" class="akvt-btn-primary">Загрузить расписание на неделю</a>
                    <a href="<?php echo esc_url($site_url . 'students/raspisanie-zanyatij/'); ?>" target="_blank">Виджет для студентов ↗</a>
                    <a href="<?php echo esc_url($site_url . 'teachers/raspisanie-zanyatij/'); ?>" target="_blank">Виджет для преподавателей ↗</a>
                </div>
            </div>

            <!-- 3. Образование и приём -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-welcome-learn-more"></span>
                    <h2>Специальности и Приём</h2>
                </div>
                <p>Контрольные цифры приёма (КЦП), сроки обучения, квалификации и учебные планы.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('post-new.php?post_type=specialty'); ?>" class="akvt-btn-primary">+ Добавить специальность</a>
                    <a href="<?php echo admin_url('edit.php?post_type=specialty'); ?>">Реестр специальностей</a>
                    <a href="<?php echo admin_url('edit-tags.php?taxonomy=spec_base&post_type=specialty'); ?>">Базы приёма (9/11 классов)</a>
                </div>
            </div>

            <!-- 4. Документы -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-media-document"></span>
                    <h2>Нормативные документы</h2>
                </div>
                <p>Загрузка официальных PDF-документов: Устав, Лицензия, Приказы с реквизитами ЭЦП.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('post-new.php?post_type=akvt_document'); ?>" class="akvt-btn-primary">+ Загрузить документ</a>
                    <a href="<?php echo admin_url('edit.php?post_type=akvt_document'); ?>">Все документы колледжа</a>
                    <a href="<?php echo admin_url('edit-tags.php?taxonomy=doc_category&post_type=akvt_document'); ?>">Категории документов</a>
                </div>
            </div>

            <!-- 5. Руководство и педагоги -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-businessperson"></span>
                    <h2>Руководство и педагоги</h2>
                </div>
                <p>Карточки администрации, преподавателей спецдисциплин и цикловых комиссий.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('post-new.php?post_type=staff_member'); ?>" class="akvt-btn-primary">+ Добавить сотрудника</a>
                    <a href="<?php echo admin_url('edit.php?post_type=staff_member'); ?>">Список сотрудников</a>
                    <a href="<?php echo admin_url('edit-tags.php?taxonomy=staff_department&post_type=staff_member'); ?>">Отделы и комиссии</a>
                </div>
            </div>

            <!-- 6. Внешний вид и Главная -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-admin-appearance"></span>
                    <h2>Главная страница и оформление</h2>
                </div>
                <p>Конструктор первого экрана (Hero), бегущая строка, баннер года и статистика.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('admin.php?page=akvt-settings&tab=home'); ?>" class="akvt-btn-primary">Конструктор главной</a>
                    <a href="<?php echo admin_url('admin.php?page=akvt-settings&tab=general'); ?>">Шапка и бегущая строка</a>
                    <a href="<?php echo admin_url('nav-menus.php'); ?>">Главное меню сайта</a>
                </div>
            </div>

            <!-- 7. Контакты и подвал -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-location-alt"></span>
                    <h2>Контакты, корпуса и реквизиты</h2>
                </div>
                <p>Единая база контактов, телефоны приёмной комиссии, адреса корпусов и соцсети.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('admin.php?page=akvt-settings&tab=contacts'); ?>" class="akvt-btn-primary">Единые контакты сайта</a>
                    <a href="<?php echo admin_url('edit.php?post_type=campus_location'); ?>">Корпуса на карте</a>
                    <a href="<?php echo admin_url('admin.php?page=akvt-settings&tab=footer'); ?>">Подвал и соцсети</a>
                </div>
            </div>

            <!-- 8. Безопасность и аудит -->
            <div class="akvt-hub-card">
                <div class="akvt-card-header">
                    <span class="dashicons dashicons-shield"></span>
                    <h2>Безопасность и аудит</h2>
                </div>
                <p>История изменений сайта: кто, когда и какие страницы редактировал.</p>
                <div class="akvt-card-links">
                    <a href="<?php echo admin_url('tools.php?page=akvt-audit-log'); ?>" class="akvt-btn-primary">Журнал изменений</a>
                    <a href="<?php echo admin_url('users.php'); ?>">Пользователи и роли</a>
                </div>
            </div>
        </div>

        <!-- Модальное окно интерактивного предпросмотра -->
        <div id="akvtPreviewModal" class="akvt-modal" style="display:none;">
            <div class="akvt-modal-content">
                <div class="akvt-modal-header">
                    <div class="akvt-preview-devices">
                        <button type="button" class="akvt-dev-btn is-active" data-w="375" data-h="812">📱 Телефон (375px)</button>
                        <button type="button" class="akvt-dev-btn" data-w="320" data-h="568">📱 Компакт (320px)</button>
                        <button type="button" class="akvt-dev-btn" data-w="768" data-h="1024">📟 Планшет (768px)</button>
                        <button type="button" class="akvt-dev-btn" data-w="100%" data-h="100%">💻 Десктоп</button>
                    </div>
                    <button type="button" class="akvt-modal-close" onclick="akvtClosePreview()">&times;</button>
                </div>
                <div class="akvt-modal-body">
                    <iframe id="akvtPreviewFrame" src="" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </div>
    <?php
}
