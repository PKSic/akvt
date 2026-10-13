<?php

namespace Database\Seeders;

use App\Models\NewsCategory;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Redirect;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AkvtMigratedDataSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../akvt_migrated_database.json');
        $redirectsPath = base_path('../redirects_301.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("Файл {$jsonPath} не найден!");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        $redirects = file_exists($redirectsPath) ? json_decode(file_get_contents($redirectsPath), true) : [];

        // 1. Создаем пользователя-администратора для входа в Filament
        $adminEmail = env('ADMIN_DEFAULT_EMAIL', 'admin@akvt.ru');
        $adminPass = env('ADMIN_DEFAULT_PASSWORD', 'AdminAKVT2026!');
        $adminName = env('ADMIN_DEFAULT_NAME', 'Главный Администратор АКВТ');

        User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => bcrypt($adminPass),
            ]
        );
        $this->command->info("Пользователь {$adminEmail} создан (Пароль из .env: {$adminPass})");

        // 2. Глобальные синглтоны (Site Settings)
        $defaultSettings = [
            'site_name' => env('COLLEGE_OFFICIAL_NAME', 'ГБПОУ АО «Астраханский колледж вычислительной техники»'),
            'site_short_name' => env('COLLEGE_SHORT_NAME', 'АКВТ'),
            'site_slogan' => env('COLLEGE_SLOGAN', 'Территория успеха'),
            'phone_reception' => env('COLLEGE_PHONE_RECEPTION', '+7 (8512) 66-75-03'),
            'phone_hotline' => env('COLLEGE_PHONE_HOTLINE', '+7 (8512) 99-99-54'),
            'email_official' => env('COLLEGE_EMAIL', 'info@akvt.ru'),
            'address' => env('COLLEGE_ADDRESS', '414056, г. Астрахань, пер. Смоляной, д. 2'),
            'vk_url' => env('COLLEGE_VK_URL', 'https://vk.com/akvt_official'),
            'tg_url' => env('COLLEGE_TG_URL', 'https://t.me/akvt_live'),
        ];
        foreach ($defaultSettings as $key => $val) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $val, 'group' => 'general']);
        }
        $this->command->info("Синглтоны настроек сайта созданы.");

        // 3. Импорт категорий и новостей
        $newsCategory = NewsCategory::firstOrCreate(
            ['slug' => 'news'],
            ['name' => 'Новости колледжа']
        );

        $postsCount = 0;
        foreach ($data['posts'] as $p) {
            $slug = Str::slug($p['slug'] ?: $p['title']);
            if (empty($slug)) continue;

            $post = NewsPost::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $newsCategory->id,
                    'title' => $p['title'],
                    'content_html' => $p['content_html'],
                    'cover_image' => !empty($p['images']) ? $p['images'][0] : null,
                    'published_at' => !empty($p['published_at']) ? date('Y-m-d H:i:s', strtotime($p['published_at'])) : now(),
                    'is_published' => true,
                ]
            );
            $postsCount++;
        }
        $this->command->info("Успешно импортировано новостей: {$postsCount}");

        // 4. Импорт статических страниц с блочным конструктором (Page Builder)
        $pagesCount = 0;
        foreach ($data['pages'] as $pg) {
            $slug = Str::slug($pg['slug'] ?: $pg['title']);
            if (empty($slug)) $slug = 'page-' . Str::random(6);

            $page = Page::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $pg['title'],
                    'full_path' => $pg['original_path'],
                    'is_active' => true,
                    'is_ros_obr_nadzor' => !empty($pg['has_rosobramadzor_markup']),
                    'sort_order' => $pagesCount,
                    'published_at' => now(),
                ]
            );

            // Создаем блок Rich Text для содержимого страницы
            if (!empty($pg['content_html'])) {
                PageBlock::create([
                    'page_id' => $page->id,
                    'block_type' => 'rich_text',
                    'content_data' => [
                        'html_content' => $pg['content_html'],
                        'container_width' => 'standard',
                    ],
                    'sort_order' => 1,
                    'is_visible' => true,
                ]);
            }
            $pagesCount++;
        }
        $this->command->info("Успешно импортировано страниц с блоками: {$pagesCount}");

        // 5. Импорт документов
        $docCategory = DocumentCategory::firstOrCreate(
            ['slug' => 'normative-acts'],
            ['name' => 'Локальные нормативные акты']
        );

        $docsCount = 0;
        foreach ($data['documents'] as $d) {
            Document::create([
                'category_id' => $docCategory->id,
                'title' => pathinfo($d['name'], PATHINFO_FILENAME),
                'file_path' => $d['rel_path'],
                'file_size' => (string) round($d['size_bytes'] / 1024, 1) . ' КБ',
                'file_mime' => $d['extension'] === '.pdf' ? 'application/pdf' : 'application/octet-stream',
                'is_active' => true,
            ]);
            $docsCount++;
        }
        $this->command->info("Успешно импортировано документов: {$docsCount}");

        // 6. Импорт таблицы 301-редиректов
        $redirectsCount = 0;
        foreach ($redirects as $old => $new) {
            Redirect::updateOrCreate(
                ['old_url' => $old],
                [
                    'new_url' => $new,
                    'status_code' => 301,
                ]
            );
            $redirectsCount++;
        }
        $this->command->info("Успешно импортировано 301-редиректов: {$redirectsCount}");
    }
}
