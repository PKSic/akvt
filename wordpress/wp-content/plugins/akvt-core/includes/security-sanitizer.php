<?php
if (!defined('ABSPATH')) exit;

/**
 * Модуль безопасности, валидации загрузок и защиты вёрстки от поломки
 */

// 1. Ограничение небезопасных типов файлов при загрузке в Медиатеку
add_filter('upload_mimes', function ($mimes) {
    // Разрешаем безопасные образовательные типы
    $mimes['pdf']  = 'application/pdf';
    $mimes['doc']  = 'application/msword';
    $mimes['docx'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    $mimes['xls']  = 'application/vnd.ms-excel';
    $mimes['xlsx'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    $mimes['webp'] = 'image/webp';
    $mimes['svg']  = 'image/svg+xml';
    $mimes['sig']  = 'application/octet-stream';

    // Запрещаем исполняемые файлы
    unset($mimes['exe'], $mimes['bat'], $mimes['sh'], $mimes['php'], $mimes['phtml'], $mimes['js']);
    return $mimes;
});

// 2. Санитизация SVG-файлов для защиты от XSS
add_filter('wp_handle_upload_prefilter', function ($file) {
    if (isset($file['type']) && $file['type'] === 'image/svg+xml') {
        $content = file_get_contents($file['tmp_name']);
        if ($content !== false) {
            // Удаляем потенциально опасные теги script, iframe, onload, onerror
            $clean = preg_replace('/<script[\s\S]*?<\/script>/i', '', $content);
            $clean = preg_replace('/on\w+="[^"]*"/i', '', $clean);
            $clean = preg_replace('/<iframe[\s\S]*?<\/iframe>/i', '', $clean);
            file_put_contents($file['tmp_name'], $clean);
        }
    }
    return $file;
});

// 3. Автоматическое масштабирование слишком больших изображений (не более 2048px)
add_filter('big_image_size_threshold', function() {
    return 2048;
});

// 4. Очистка инлайн-мусора при сохранении записей (защита дизайна от "кривого Word")
add_filter('content_save_pre', function ($content) {
    if (empty($content)) return $content;

    // Удаляем inline styles с фиксированной шириной width: ...px, ломающей мобильную верстку
    $content = preg_replace('/width:\s*[4-9]\d{2,}px;?/i', 'max-width: 100%;', $content);
    $content = preg_replace('/width:\s*\d{4,}px;?/i', 'max-width: 100%;', $content);

    // Удаляем inline mso стили из Word
    $content = preg_replace('/mso-[^:]+:[^;"]+;?/i', '', $content);

    return $content;
});
