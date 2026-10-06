<?php
if (!defined('ABSPATH')) exit;

/**
 * Единый центр настроек АКВТ (Settings Hub)
 * Управляет шапкой, подвалом, контактами, реквизитами и главной страницей
 */

function akvt_register_settings() {
    register_setting('akvt_settings_group', 'akvt_options', 'akvt_sanitize_settings');
}
add_action('admin_init', 'akvt_register_settings');

function akvt_sanitize_settings($input) {
    $clean = [];
    if (!is_array($input)) return $clean;

    foreach ($input as $k => $v) {
        if (is_array($v)) {
            $clean[$k] = array_map('sanitize_text_field', $v);
        } else {
            $clean[$k] = sanitize_text_field($v);
        }
    }
    return $clean;
}

/**
 * Вспомогательная функция для получения настроек АКВТ
 */
function akvt_get_option($key, $default = '') {
    $opts = get_option('akvt_options', []);
    if (isset($opts[$key]) && $opts[$key] !== '') {
        return $opts[$key];
    }

    // Дефолтные значения из актуального сайта
    $defaults = [
        // Шапка
        'header_slogan'         => 'ТЕРРИТОРИЯ УСПЕХА',
        'header_ticker_active'  => '1',
        'header_ticker_text'    => 'Приёмная кампания 2026 открыта · Документы подаются очно и онлайн · Телефон приёмной комиссии: 66-75-03',
        'header_cta_text'       => 'Поступить',
        'header_cta_link'       => '/postupayushhim/priemnaya-kampaniya-2026/',
        'header_year_banner'    => '2026 — Год единства народов России',
        'header_hotline'        => '54-08-35',
        'header_bvi_enabled'    => '1',

        // Главная страница
        'hero_eyebrow'          => 'ГБПОУ АО · АСТРАХАНЬ · С 1966 ГОДА',
        'hero_title'            => 'Территория успеха в мире информационных технологий',
        'hero_subtitle'         => 'Астраханский колледж вычислительной техники — ведущий центр среднего профессионального образования Юга России в сфере IT, программной инженерии, кибербезопасности и автоматизации.',
        'hero_btn_primary'      => 'Поступить в АКВТ',
        'hero_btn_primary_link' => '/postupayushhim/priemnaya-kampaniya-2026/',
        'hero_btn_sec'          => 'Схема проезда',
        'hero_btn_sec_link'     => '/shema-proezda/',
        
        // Статистика
        'stat_1_val'            => '1500+',
        'stat_1_lbl'            => 'Студентов',
        'stat_2_val'            => '450+',
        'stat_2_lbl'            => 'Бюджетных мест',
        'stat_3_val'            => '60+',
        'stat_3_lbl'            => 'Партнёров-работодателей',
        'stat_4_val'            => '94%',
        'stat_4_lbl'            => 'Трудоустройство',

        // Bento-сетка
        'bento_1_title'         => 'Приёмная кампания 2026',
        'bento_1_desc'          => 'Правила приёма, контрольные цифры и подача заявления',
        'bento_1_link'          => '/postupayushhim/priemnaya-kampaniya-2026/',
        'bento_2_title'         => 'Центр цифрового образования «IT-куб»',
        'bento_2_desc'          => 'Бесплатное IT-образование для школьников 7-17 лет',
        'bento_2_link'          => '/osnovnye-svedeniya-2-2/czentr-czifrovogo-obrazovaniya-detej-it-kub/',
        'bento_3_title'         => 'Студенческое общежитие',
        'bento_3_desc'          => 'Комфортные комнаты для иногородних студентов',
        'bento_3_link'          => '/postupayushhim/obshhezhitie/',
        'bento_4_title'         => 'Расписание пар',
        'bento_4_desc'          => 'Актуальная сетка занятий и звонков на эту неделю',
        'bento_4_link'          => '/students/raspisanie-zanyatij/',
        'bento_5_title'         => 'Трудоустройство выпускников',
        'bento_5_desc'          => 'Вакансии, стажировки и карьерные треки',
        'bento_5_link'          => '/osnovnye-svedeniya-2-2/sstv/',
        'bento_6_title'         => 'Схема проезда и корпуса',
        'bento_6_desc'          => 'Интерактивная карта, автобусы и контакты',
        'bento_6_link'          => '/shema-proezda/',

        // Блок директора
        'dir_name'              => 'Дмитрий Александрович Лунёв',
        'dir_title'             => 'Директор ГБПОУ АО «АКВТ»',
        'dir_contacts'          => 'тел. 54-08-35 · akvt@astrobl.ru',
        'dir_quote'             => 'Приветствую вас на официальном сайте Астраханского колледжа вычислительной техники! АКВТ — это пространство возможностей, передовых технологий и качественного образования.',

        // Приёмная кампания
        'admissions_start'      => '2026-06-20',
        'admissions_end_budget' => '2026-08-15',
        'admissions_end_comm'   => '2026-11-25',
        'admissions_phone'      => '+7 (8512) 66-75-03',
        'admissions_email'      => 'priem@akvt.ru',

        // Стипендии и общежитие
        'stipend_acad'          => '1 100 ₽ / мес.',
        'stipend_high'          => '1 650 ₽ / мес.',
        'stipend_soc'           => '1 650 ₽ / мес.',
        'dorm_cost'             => '750 ₽ / мес.',
        'dorm_address'          => 'г. Астрахань, ул. Ахшарумова, д. 80',
        'dorm_phone'            => '99-99-54',

        // IT-куб
        'itcube_head'           => 'Савина Наталья Викторовна',
        'itcube_phone'          => '66-75-03',
        'itcube_email'          => 'itcube@akvt.ru',
        'itcube_address'        => 'г. Астрахань, ул. Боевая, д. 66',

        // Контакты
        'contact_phone'         => '+7 (8512) 54-08-35',
        'contact_admissions'    => '+7 (8512) 66-75-03',
        'contact_email'         => 'office@akvt.astrobl.ru',
        'contact_address'       => 'г. Астрахань, пер. Смоляной, д. 2',
        'contact_hours'         => 'Пн-Пт: 8:30 - 17:00, Сб: 8:30 - 14:00',
        'contact_anticorrupt'   => '+7 (8512) 54-08-35',
        'contact_vk'            => 'https://vk.com/akvt_30',
        'contact_telegram'      => 'https://t.me/akvt30rus',
        'contact_ok'            => 'http://www.ok.ru/akvt30ru',
        'contact_sdo'           => 'http://sdo2.akvt.ru',

        // SEO и Аналитика
        'seo_title'             => 'АКВТ — Астраханский колледж вычислительной техники · Официальный сайт',
        'seo_description'       => 'Официальный сайт ГБПОУ АО «Астраханский колледж вычислительной техники». Приёмная кампания 2026, IT-специальности СПО, расписание занятий, документы с ЭЦП, IT-куб.',
        'seo_keywords'          => 'АКВТ, колледж вычислительной техники, колледж астрахань, поступить после 9 класса, программирование, СПО',
        'seo_ym_counter'        => '26312450',

        // Подвал
        'footer_copyright'      => '© 2014–2026 ГБПОУ АО «Астраханский колледж вычислительной техники». При использовании материалов ссылка обязательна.',
    ];

    return isset($defaults[$key]) ? $defaults[$key] : $default;
}

/**
 * Регистрация подменю в Настройках
 */
function akvt_add_settings_menu() {
    add_menu_page(
        'Настройки АКВТ',
        'Настройки АКВТ',
        'manage_options',
        'akvt-settings',
        'akvt_render_settings_page',
        'dashicons-admin-settings',
        59
    );
}
add_action('admin_menu', 'akvt_add_settings_menu');

function akvt_render_settings_page() {
    $active_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'general';
    ?>
    <div class="wrap" style="max-width: 1000px;">
        <h1 style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
            <span class="dashicons dashicons-admin-settings" style="font-size:32px; width:32px; height:32px;"></span>
            Единый центр настроек АКВТ
        </h1>

        <nav class="nav-tab-wrapper" style="margin-bottom: 24px;">
            <a href="?page=akvt-settings&tab=general" class="nav-tab <?php echo $active_tab === 'general' ? 'nav-tab-active' : ''; ?>">Шапка и бегущая строка</a>
            <a href="?page=akvt-settings&tab=home" class="nav-tab <?php echo $active_tab === 'home' ? 'nav-tab-active' : ''; ?>">Главная страница и метрики</a>
            <a href="?page=akvt-settings&tab=contacts" class="nav-tab <?php echo $active_tab === 'contacts' ? 'nav-tab-active' : ''; ?>">Контакты и реквизиты</a>
            <a href="?page=akvt-settings&tab=footer" class="nav-tab <?php echo $active_tab === 'footer' ? 'nav-tab-active' : ''; ?>">Подвал и соцсети</a>
        </nav>

        <form method="post" action="options.php" style="background:#fff; padding:24px 32px; border-radius:12px; border:1px solid #dcd6ce; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <?php
            settings_fields('akvt_settings_group');

            if ($active_tab === 'general') : ?>
                <h2 style="margin-top:0;">Шапка сайта (Header)</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Слоган в логотипе:</th>
                        <td><input type="text" name="akvt_options[header_slogan]" value="<?php echo esc_attr(akvt_get_option('header_slogan')); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Бегущая строка объявлений (Ticker):</th>
                        <td>
                            <label style="display:block; margin-bottom:8px;">
                                <input type="checkbox" name="akvt_options[header_ticker_active]" value="1" <?php checked(akvt_get_option('header_ticker_active'), '1'); ?>>
                                Включить бегущую строку в самом верху сайта
                            </label>
                            <textarea name="akvt_options[header_ticker_text]" rows="3" class="large-text"><?php echo esc_textarea(akvt_get_option('header_ticker_text')); ?></textarea>
                            <p class="description">Текст для верхней бегущей полосы на всех страницах.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Официальный баннер года:</th>
                        <td>
                            <label>
                                <input type="checkbox" name="akvt_options[header_year_banner]" value="1" <?php checked(akvt_get_option('header_year_banner'), '1'); ?>>
                                Отображать плашку «2026 — Год единства народов России»
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Кнопка действия (CTA в шапке):</th>
                        <td>
                            <input type="text" name="akvt_options[header_cta_text]" value="<?php echo esc_attr(akvt_get_option('header_cta_text')); ?>" placeholder="Текст, напр. Поступить" style="margin-right:10px;">
                            <input type="text" name="akvt_options[header_cta_link]" value="<?php echo esc_attr(akvt_get_option('header_cta_link')); ?>" placeholder="Ссылка, напр. /priem/" class="regular-text">
                        </td>
                    </tr>
                </table>

            <?php elseif ($active_tab === 'home') : ?>
                <h2 style="margin-top:0;">Конструктор первого экрана главной</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Надзаголовок (Eyebrow):</th>
                        <td><input type="text" name="akvt_options[hero_eyebrow]" value="<?php echo esc_attr(akvt_get_option('hero_eyebrow')); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Главный заголовок:</th>
                        <td><input type="text" name="akvt_options[hero_title]" value="<?php echo esc_attr(akvt_get_option('hero_title')); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Подзаголовок / Описание:</th>
                        <td><textarea name="akvt_options[hero_subtitle]" rows="3" class="large-text"><?php echo esc_textarea(akvt_get_option('hero_subtitle')); ?></textarea></td>
                    </tr>
                    <tr>
                        <th scope="row">Кнопки первого экрана:</th>
                        <td>
                            <div style="margin-bottom:8px;">
                                <strong>Главная: </strong>
                                <input type="text" name="akvt_options[hero_btn_primary]" value="<?php echo esc_attr(akvt_get_option('hero_btn_primary')); ?>" placeholder="Текст кнопки">
                                <input type="text" name="akvt_options[hero_btn_primary_link]" value="<?php echo esc_attr(akvt_get_option('hero_btn_primary_link')); ?>" placeholder="Ссылка" class="regular-text">
                            </div>
                            <div>
                                <strong>Вторая: </strong>
                                <input type="text" name="akvt_options[hero_btn_sec]" value="<?php echo esc_attr(akvt_get_option('hero_btn_sec')); ?>" placeholder="Текст кнопки">
                                <input type="text" name="akvt_options[hero_btn_sec_link]" value="<?php echo esc_attr(akvt_get_option('hero_btn_sec_link')); ?>" placeholder="Ссылка" class="regular-text">
                            </div>
                        </td>
                    </tr>
                </table>

                <h3 style="margin-top:24px;">Цифровые метрики колледжа (Статистика)</h3>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
                    <?php for ($i = 1; $i <= 4; $i++): ?>
                        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                            <label style="display:block; font-weight:600; font-size:0.85rem;">Показатель <?php echo $i; ?> (число):</label>
                            <input type="text" name="akvt_options[stat_<?php echo $i; ?>_val]" value="<?php echo esc_attr(akvt_get_option('stat_' . $i . '_val')); ?>" style="width:100%; margin-bottom:8px;">
                            <label style="display:block; font-weight:600; font-size:0.85rem;">Подпись:</label>
                            <input type="text" name="akvt_options[stat_<?php echo $i; ?>_lbl]" value="<?php echo esc_attr(akvt_get_option('stat_' . $i . '_lbl')); ?>" style="width:100%;">
                        </div>
                    <?php endfor; ?>
                </div>

            <?php elseif ($active_tab === 'contacts') : ?>
                <h2 style="margin-top:0;">Единый центр контактов (Contact Hub)</h2>
                <p class="description">Эти контакты автоматически синхронизируются в шапке, подвале, на страницах приёма и в обращениях граждан.</p>
                <table class="form-table">
                    <tr>
                        <th scope="row">Основной телефон приёмной:</th>
                        <td><input type="text" name="akvt_options[contact_phone]" value="<?php echo esc_attr(akvt_get_option('contact_phone')); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Горячая линия приёмной комиссии:</th>
                        <td><input type="text" name="akvt_options[contact_admissions]" value="<?php echo esc_attr(akvt_get_option('contact_admissions')); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Официальный E-mail:</th>
                        <td><input type="email" name="akvt_options[contact_email]" value="<?php echo esc_attr(akvt_get_option('contact_email')); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Юридический и фактический адрес:</th>
                        <td><input type="text" name="akvt_options[contact_address]" value="<?php echo esc_attr(akvt_get_option('contact_address')); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Режим и часы работы:</th>
                        <td><input type="text" name="akvt_options[contact_hours]" value="<?php echo esc_attr(akvt_get_option('contact_hours')); ?>" class="large-text"></td>
                    </tr>
                </table>

            <?php elseif ($active_tab === 'footer') : ?>
                <h2 style="margin-top:0;">Подвал сайта (Footer) и социальные сети</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Сообщество ВКонтакте:</th>
                        <td><input type="url" name="akvt_options[contact_vk]" value="<?php echo esc_attr(akvt_get_option('contact_vk')); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Канал в Telegram:</th>
                        <td><input type="url" name="akvt_options[contact_telegram]" value="<?php echo esc_attr(akvt_get_option('contact_telegram')); ?>" class="large-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Телефон доверия / противодействие коррупции:</th>
                        <td><input type="text" name="akvt_options[footer_anti_corrupt]" value="<?php echo esc_attr(akvt_get_option('footer_anti_corrupt')); ?>" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th scope="row">Текст копирайта:</th>
                        <td><textarea name="akvt_options[footer_copyright]" rows="2" class="large-text"><?php echo esc_textarea(akvt_get_option('footer_copyright')); ?></textarea></td>
                    </tr>
                </table>
            <?php endif; ?>

            <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e2e8f0;">
                <?php submit_button('Сохранить изменения', 'primary large', 'submit', false); ?>
            </div>
        </form>
    </div>
    <?php
}
