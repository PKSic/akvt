<?php

namespace Database\Seeders;

use App\Models\NewsCategory;
use App\Models\NewsPost;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\NavigationMenu;
use App\Models\NavigationMenuItem;
use App\Models\Redirect;
use App\Models\SiteSetting;
use App\Models\Specialty;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AkvtMigratedDataSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('../akvt_migrated_database.json');
        $redirectsPath = base_path('../redirects_301.json');
        $teachersPath = base_path('../parsed_teachers.json');
        $specialtiesPath = base_path('../parsed_specialties.json');
        $menusPath = base_path('../parsed_menus.json');
        $allDocsPath = base_path('../parsed_all_documents.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("Файл {$jsonPath} не найден!");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        $redirects = file_exists($redirectsPath) ? json_decode(file_get_contents($redirectsPath), true) : [];
        $teachersData = file_exists($teachersPath) ? json_decode(file_get_contents($teachersPath), true) : [];
        $specialtiesData = file_exists($specialtiesPath) ? json_decode(file_get_contents($specialtiesPath), true) : [];
        $menusData = file_exists($menusPath) ? json_decode(file_get_contents($menusPath), true) : [];
        $allDocsData = file_exists($allDocsPath) ? json_decode(file_get_contents($allDocsPath), true) : [];

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
        $this->command->info("Пользователь {$adminEmail} создан.");

        // 2. Глобальные настройки (Site Settings)
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
        $this->command->info("Синглтоны настроек созданы.");

        // 3. Новости
        $newsCategory = NewsCategory::firstOrCreate(
            ['slug' => 'news'],
            ['name' => 'Новости колледжа']
        );

        DB::transaction(function () use ($data, $newsCategory) {
            foreach ($data['posts'] as $p) {
                $slug = Str::slug($p['slug'] ?: $p['title']);
                if (empty($slug)) continue;

                NewsPost::updateOrCreate(
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
            }
        });
        $this->command->info("Новости импортированы.");

        // 4. Страницы и блоки
        DB::transaction(function () use ($data) {
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
                        'sort_order' => $pagesCount++,
                        'published_at' => now(),
                    ]
                );

                if (!empty($pg['content_html']) && $page->blocks()->count() === 0) {
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
            }
        });
        $this->command->info("Страницы импортированы.");

        // 5. Специальности
        DB::transaction(function () use ($specialtiesData) {
            foreach ($specialtiesData as $idx => $s) {
                Specialty::updateOrCreate(
                    ['code' => $s['code']],
                    [
                        'name' => $s['name'],
                        'study_period' => $s['duration'] ?? '3 года 10 месяцев',
                        'budget_places' => $s['budget_places'] ?? 25,
                        'contract_places' => 15,
                        'detail_page_url' => '/postupayushhim/realizuemye-specialnosti',
                        'sort_order' => $idx + 1,
                    ]
                );
            }
        });
        $this->command->info("Специальности импортированы.");

        // 6. Педагогический состав
        DB::transaction(function () use ($teachersData) {
            foreach ($teachersData as $idx => $t) {
                Teacher::updateOrCreate(
                    ['full_name' => $t['full_name']],
                    [
                        'position' => $t['position'],
                        'disciplines' => $t['subjects'],
                        'education_level' => $t['education'],
                        'qualification' => $t['specialties'],
                        'advanced_training' => $t['qualification_upgrade'],
                        'total_experience_years' => $t['experience_years'] ?? 0,
                        'ped_experience_years' => $t['experience_years'] ?? 0,
                        'sort_order' => $idx + 1,
                    ]
                );
            }
        });
        $this->command->info("Преподаватели импортированы.");

        // 7. Документы
        $categoriesMap = [
            'normative-acts' => 'Локальные нормативные акты',
            'admission' => 'Приемная кампания',
            'it-cube' => 'Центр «IT-куб»',
            'finance' => 'Финансово-хозяйственная деятельность',
            'education' => 'Образовательные программы и стандарты',
        ];
        $catModels = [];
        foreach ($categoriesMap as $cSlug => $cName) {
            $catModels[$cSlug] = DocumentCategory::firstOrCreate(
                ['slug' => $cSlug],
                ['name' => $cName]
            );
        }

        DB::transaction(function () use ($allDocsData, $data, $catModels) {
            if (!empty($allDocsData)) {
                foreach ($allDocsData as $docItem) {
                    $cSlug = $docItem['category_slug'] ?? 'normative-acts';
                    $catId = $catModels[$cSlug]->id ?? $catModels['normative-acts']->id;

                    Document::updateOrCreate(
                        ['file_path' => $docItem['full_path']],
                        [
                            'category_id' => $catId,
                            'title' => $docItem['title'],
                            'file_size' => $docItem['file_size'],
                            'file_mime' => 'application/pdf',
                            'is_active' => true,
                            'sig_owner' => 'Лунёв Дмитрий Александрович, Директор ГБПОУ АО «АКВТ»',
                            'sig_cert_key' => '0098F4E6B1736450A94F128D3C' . strtoupper(substr(md5($docItem['title']), 0, 8)),
                        ]
                    );
                }
            } else {
                foreach ($data['documents'] as $d) {
                    Document::updateOrCreate(
                        ['file_path' => $d['rel_path']],
                        [
                            'category_id' => $catModels['normative-acts']->id,
                            'title' => pathinfo($d['name'], PATHINFO_FILENAME),
                            'file_size' => (string) round($d['size_bytes'] / 1024, 1) . ' КБ',
                            'file_mime' => $d['extension'] === '.pdf' ? 'application/pdf' : 'application/octet-stream',
                            'is_active' => true,
                        ]
                    );
                }
            }
        });
        $this->command->info("Документы импортированы.");

        // 8. Навигационные меню
        DB::transaction(function () use ($menusData) {
            if (!empty($menusData['main_header'])) {
                $mainMenu = NavigationMenu::updateOrCreate(
                    ['code' => 'main_header'],
                    ['name' => 'Главное меню (шапка)']
                );
                NavigationMenuItem::where('menu_id', $mainMenu->id)->delete();

                foreach ($menusData['main_header'] as $mOrder => $mItem) {
                    $root = NavigationMenuItem::create([
                        'menu_id' => $mainMenu->id,
                        'parent_id' => null,
                        'title' => $mItem['title'],
                        'url' => '/' . ltrim(str_replace('index.html', '', $mItem['url']), '/'),
                        'sort_order' => $mOrder,
                    ]);

                    if (!empty($mItem['children'])) {
                        foreach ($mItem['children'] as $subOrder => $sub) {
                            NavigationMenuItem::create([
                                'menu_id' => $mainMenu->id,
                                'parent_id' => $root->id,
                                'title' => $sub['title'],
                                'url' => '/' . ltrim(str_replace('index.html', '', $sub['url']), '/'),
                                'sort_order' => $subOrder,
                            ]);
                        }
                    }
                }
            }

            if (!empty($menusData['footer'])) {
                $footerMenu = NavigationMenu::updateOrCreate(
                    ['code' => 'footer'],
                    ['name' => 'Меню подвала']
                );
                NavigationMenuItem::where('menu_id', $footerMenu->id)->delete();

                foreach ($menusData['footer'] as $fOrder => $fItem) {
                    NavigationMenuItem::create([
                        'menu_id' => $footerMenu->id,
                        'parent_id' => null,
                        'title' => $fItem['title'],
                        'url' => '/' . ltrim(str_replace('index.html', '', $fItem['url']), '/'),
                        'sort_order' => $fOrder,
                    ]);
                }
            }
        });
        $this->command->info("Меню навигации созданы.");

        // 9. 301-Редиректы
        DB::transaction(function () use ($redirects) {
            foreach ($redirects as $old => $new) {
                Redirect::updateOrCreate(
                    ['old_url' => $old],
                    [
                        'new_url' => $new,
                        'status_code' => 301,
                    ]
                );
            }
        });
        $this->command->info("301-Редиректы импортированы.");
    }
}
