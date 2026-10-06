<?php
if (!defined('ABSPATH')) exit;

/**
 * Регистрация Custom Post Type: Нормативные документы
 */
function akvt_register_document_cpt() {
    $labels = [
        'name'               => 'Документы',
        'singular_name'      => 'Документ',
        'menu_name'          => 'Документы',
        'add_new'            => 'Загрузить документ',
        'add_new_item'       => 'Загрузить новый документ',
        'edit_item'          => 'Редактировать документ',
        'all_items'          => 'Все документы',
        'search_items'       => 'Искать документы',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => 'dokumenty',
        'rewrite'            => ['slug' => 'dokumenty', 'with_front' => false],
        'menu_icon'          => 'dashicons-media-document',
        'supports'           => ['title'],
        'show_in_rest'       => true,
    ];

    register_post_type('akvt_document', $args);

    // Таксономия: Категории документов
    register_taxonomy('doc_category', 'akvt_document', [
        'labels' => [
            'name'          => 'Категории документов',
            'singular_name' => 'Категория',
            'menu_name'     => 'Категории документов',
        ],
        'hierarchical' => true,
        'show_ui'      => true,
        'show_in_rest' => true,
        'rewrite'      => ['slug' => 'kategoriya-dokumentov'],
    ]);
}
add_action('init', 'akvt_register_document_cpt');

/**
 * Метабокс файла и параметров документа
 */
function akvt_document_meta_box() {
    add_meta_box(
        'akvt_document_details',
        'Файл документа и реквизиты ЭЦП',
        'akvt_render_document_meta_box',
        'akvt_document',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'akvt_document_meta_box');

function akvt_render_document_meta_box($post) {
    wp_nonce_field('akvt_document_nonce_action', 'akvt_document_nonce');

    $file_url = get_post_meta($post->ID, '_akvt_doc_file_url', true);
    $date     = get_post_meta($post->ID, '_akvt_doc_date', true);
    $has_sig  = get_post_meta($post->ID, '_akvt_doc_has_sig', true);
    $sig_file = get_post_meta($post->ID, '_akvt_doc_sig_file', true);
    $signer   = get_post_meta($post->ID, '_akvt_doc_signer', true);
    ?>
    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
        <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_doc_file_url">Прямая ссылка на файл (PDF / DOCX):</label>
            <input style="width:100%;padding:8px 12px;" type="text" id="akvt_doc_file_url" name="akvt_doc_file_url" value="<?php echo esc_attr($file_url); ?>" placeholder="https://.../ustav.pdf или /wp-content/uploads/...">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
                <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_doc_date">Дата утверждения документа:</label>
                <input style="width:100%;padding:8px 12px;" type="date" id="akvt_doc_date" name="akvt_doc_date" value="<?php echo esc_attr($date); ?>">
            </div>
            <div>
                <label style="display:block;font-weight:600;margin-bottom:4px;" for="akvt_doc_signer">ФИО подписанта:</label>
                <input style="width:100%;padding:8px 12px;" type="text" id="akvt_doc_signer" name="akvt_doc_signer" value="<?php echo esc_attr($signer); ?>" placeholder="Лунёв Д. А., директор">
            </div>
        </div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <label style="font-weight:600;">
                <input type="checkbox" name="akvt_doc_has_sig" value="1" <?php checked($has_sig, '1'); ?>>
                Документ подписан простой электронной подписью (ЭЦП по ГОСТ)
            </label>
            <div style="margin-top: 8px;">
                <label style="display:block;font-size:0.9rem;margin-bottom:4px;" for="akvt_doc_sig_file">Файл открепленной электронной подписи (.sig / ссылка):</label>
                <input style="width:100%;padding:6px 10px;" type="text" id="akvt_doc_sig_file" name="akvt_doc_sig_file" value="<?php echo esc_attr($sig_file); ?>" placeholder="https://.../document.sig">
            </div>
        </div>
    </div>
    <?php
}

function akvt_save_document_meta($post_id) {
    if (!isset($_POST['akvt_document_nonce']) || !wp_verify_nonce($_POST['akvt_document_nonce'], 'akvt_document_nonce_action')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['akvt_doc_file_url'])) {
        update_post_meta($post_id, '_akvt_doc_file_url', sanitize_text_field($_POST['akvt_doc_file_url']));
    }
    if (isset($_POST['akvt_doc_date'])) {
        update_post_meta($post_id, '_akvt_doc_date', sanitize_text_field($_POST['akvt_doc_date']));
    }
    if (isset($_POST['akvt_doc_signer'])) {
        update_post_meta($post_id, '_akvt_doc_signer', sanitize_text_field($_POST['akvt_doc_signer']));
    }
    if (isset($_POST['akvt_doc_sig_file'])) {
        update_post_meta($post_id, '_akvt_doc_sig_file', sanitize_text_field($_POST['akvt_doc_sig_file']));
    }
    $has_sig = isset($_POST['akvt_doc_has_sig']) ? '1' : '0';
    update_post_meta($post_id, '_akvt_doc_has_sig', $has_sig);
}
add_action('save_post_akvt_document', 'akvt_save_document_meta');
