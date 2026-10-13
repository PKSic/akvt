<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Дерево страниц (Pages)
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable()->index();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('full_path')->index();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_ros_obr_nadzor')->default(false);
            $table->string('rosobrnadzor_section')->nullable();
            $table->json('seo_meta')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // 2. Блочный конструктор (Page Blocks)
        Schema::create('page_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('block_type'); // hero_banner, rich_text, accordion_faq, document_registry, specialties_grid, news_feed, media_gallery, feedback_form
            $table->json('content_data');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        // 3. Категории документов
        Schema::create('document_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Реестр нормативных документов с ЭЦП (63-ФЗ / Рособрнадзор 831)
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->nullable()->constrained('document_categories')->nullOnDelete();
            $table->string('title');
            $table->string('reg_number')->nullable();
            $table->date('approved_date')->nullable();
            $table->string('file_path');
            $table->string('file_size')->nullable();
            $table->string('file_mime')->default('application/pdf');
            $table->string('sig_file_path')->nullable();
            $table->string('sig_owner')->nullable();
            $table->date('sig_valid_to')->nullable();
            $table->string('sig_cert_key')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 5. Педагогический состав (Приказ 831, itemprop="teachingStaff")
        Schema::create('teachers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('photo_path')->nullable();
            $table->string('position');
            $table->string('education_level')->nullable();
            $table->string('qualification')->nullable();
            $table->text('disciplines')->nullable();
            $table->integer('total_experience_years')->default(0);
            $table->integer('ped_experience_years')->default(0);
            $table->text('advanced_training')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 6. Специальности (Образовательные программы)
        Schema::create('specialties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code'); // 09.02.07
            $table->string('name'); // Информационные системы и программирование
            $table->string('study_period')->nullable(); // 3 года 10 мес.
            $table->integer('budget_places')->default(0);
            $table->integer('contract_places')->default(0);
            $table->string('detail_page_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 7. Рубрики новостей
        Schema::create('news_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 8. Новости и статьи (очищенные от шорткодов WP)
        Schema::create('news_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->nullable()->constrained('news_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_image')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('content_html');
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        // 9. Меню навигации
        Schema::create('navigation_menus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // main_header, footer, sidebar
            $table->string('code')->unique();
            $table->timestamps();
        });

        // 10. Пункты меню (Дерево drag-and-drop)
        Schema::create('navigation_menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('menu_id')->constrained('navigation_menus')->cascadeOnDelete();
            $table->uuid('parent_id')->nullable()->index();
            $table->string('title');
            $table->string('url');
            $table->string('target')->default('_self');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 11. Глобальные настройки (Синглтоны)
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // 12. Таблица 301-редиректов (сохранение SEO)
        Schema::create('redirects', function (Blueprint $table) {
            $table->id();
            $table->string('old_url')->unique();
            $table->string('new_url');
            $table->integer('status_code')->default(301);
            $table->integer('hit_count')->default(0);
            $table->timestamps();
        });

        // 13. Журнал аудита действий (12 месяцев хранения по ТЗ)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // created, updated, deleted, login, download
            $table->string('entity_type')->nullable();
            $table->string('entity_id')->nullable();
            $table->json('payload')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('redirects');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('navigation_menu_items');
        Schema::dropIfExists('navigation_menus');
        Schema::dropIfExists('news_posts');
        Schema::dropIfExists('news_categories');
        Schema::dropIfExists('specialties');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_categories');
        Schema::dropIfExists('page_blocks');
        Schema::dropIfExists('pages');
    }
};
