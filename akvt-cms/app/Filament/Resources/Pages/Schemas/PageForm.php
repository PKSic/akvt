<?php

namespace App\Filament\Resources\Pages\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->label('Заголовок страницы')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('slug')
                    ->label('Слаг (URL-адрес страницы)')
                    ->required(),
                TextInput::make('full_path')
                    ->label('Оригинальный путь')
                    ->disabled(),
                Toggle::make('is_active')
                    ->label('Опубликована')
                    ->default(true),
                Toggle::make('is_ros_obr_nadzor')
                    ->label('Раздел «Сведения об ОО» (Приказ Рособрнадзора № 831)')
                    ->default(false),
                TextInput::make('rosobrnadzor_section')
                    ->label('Идентификатор подраздела Рособрнадзора'),

                // -------------------------------------------------------------
                // БЛОЧНЫЙ КОНСТРУКТОР СТРАНИЦЫ (PAGE BUILDER)
                // -------------------------------------------------------------
                Repeater::make('blocks')
                    ->relationship('blocks')
                    ->label('Блочный конструктор страницы (Page Builder)')
                    ->orderColumn('sort_order')
                    ->collapsible()
                    ->cloneable()
                    ->itemLabel(fn (array $state): ?string => match ($state['block_type'] ?? '') {
                        'hero_banner' => '🎯 Главный баннер (Hero)',
                        'rich_text' => '📝 Текстовая секция (WYSIWYG)',
                        'accordion_faq' => '❓ Аккордеон / FAQ',
                        'document_registry' => '📁 Сетка нормативных документов с ЭЦП',
                        'specialties_grid' => '🎓 Визитки специальностей',
                        'news_feed' => '📰 Сетка новостей / анонсов',
                        'media_gallery' => '🖼️ Галерея / Медиа',
                        'feedback_form' => '📩 Форма обратной связи (152-ФЗ)',
                        default => 'Блок страницы',
                    })
                    ->schema([
                        Select::make('block_type')
                            ->label('Тип компонента')
                            ->options([
                                'hero_banner' => '🎯 Главный баннер (Hero)',
                                'rich_text' => '📝 Текстовая секция (WYSIWYG)',
                                'accordion_faq' => '❓ Аккордеон / FAQ',
                                'document_registry' => '📁 Сетка нормативных документов с ЭЦП',
                                'specialties_grid' => '🎓 Визитки специальностей',
                                'news_feed' => '📰 Сетка новостей / анонсов',
                                'media_gallery' => '🖼️ Галерея / Медиа',
                                'feedback_form' => '📩 Форма обратной связи (152-ФЗ)',
                            ])
                            ->required()
                            ->live(),

                        // 1. Hero
                        TextInput::make('content_data.title')
                            ->label('Заголовок баннера')
                            ->visible(fn ($get) => $get('block_type') === 'hero_banner'),
                        TextInput::make('content_data.subtitle')
                            ->label('Подзаголовок баннера')
                            ->visible(fn ($get) => $get('block_type') === 'hero_banner'),
                        FileUpload::make('content_data.image_url')
                            ->label('Фоновое изображение')
                            ->directory('pages/hero')
                            ->visible(fn ($get) => $get('block_type') === 'hero_banner'),
                        TextInput::make('content_data.button_text')
                            ->label('Текст кнопки действия')
                            ->visible(fn ($get) => $get('block_type') === 'hero_banner'),
                        TextInput::make('content_data.button_url')
                            ->label('Ссылка кнопки действия')
                            ->visible(fn ($get) => $get('block_type') === 'hero_banner'),

                        // 2. Rich Text (WYSIWYG)
                        RichEditor::make('content_data.html_content')
                            ->label('Содержимое текстового блока (H2-H4, списки, таблицы)')
                            ->visible(fn ($get) => $get('block_type') === 'rich_text')
                            ->columnSpanFull(),

                        // 3. FAQ / Accordion
                        Repeater::make('content_data.faq_items')
                            ->label('Список спойлеров / вопросов и ответов')
                            ->visible(fn ($get) => $get('block_type') === 'accordion_faq')
                            ->schema([
                                TextInput::make('question')->label('Вопрос / Заголовок спойлера')->required(),
                                RichEditor::make('answer')->label('Ответ / Текст спойлера')->required(),
                            ])
                            ->columnSpanFull(),

                        // 4. Documents Registry
                        Select::make('content_data.document_category_id')
                            ->label('Категория документов для вывода')
                            ->options(fn () => \App\Models\DocumentCategory::pluck('name', 'id'))
                            ->visible(fn ($get) => $get('block_type') === 'document_registry'),
                        Toggle::make('content_data.show_sig_stamp')
                            ->label('Отображать синий штамп электронной подписи ЭЦП')
                            ->default(true)
                            ->visible(fn ($get) => $get('block_type') === 'document_registry'),

                        // 5. Specialties Grid
                        TextInput::make('content_data.specialties_limit')
                            ->label('Количество выводимых специальностей')
                            ->numeric()
                            ->default(6)
                            ->visible(fn ($get) => $get('block_type') === 'specialties_grid'),

                        // 6. News Feed
                        TextInput::make('content_data.news_limit')
                            ->label('Количество последних новостей (3, 6, 9)')
                            ->numeric()
                            ->default(6)
                            ->visible(fn ($get) => $get('block_type') === 'news_feed'),
                        Toggle::make('content_data.show_archive_btn')
                            ->label('Показывать кнопку «Все новости»')
                            ->default(true)
                            ->visible(fn ($get) => $get('block_type') === 'news_feed'),

                        // 7. Media Gallery
                        FileUpload::make('content_data.gallery_photos')
                            ->label('Фотографии галереи')
                            ->multiple()
                            ->directory('pages/gallery')
                            ->visible(fn ($get) => $get('block_type') === 'media_gallery'),

                        // 8. Feedback Form
                        TextInput::make('content_data.target_email')
                            ->label('Email для получения обращений')
                            ->default('priem@akvt.ru')
                            ->visible(fn ($get) => $get('block_type') === 'feedback_form'),
                        TextInput::make('content_data.department')
                            ->label('Подразделение (Приемная комиссия / Учебная часть)')
                            ->visible(fn ($get) => $get('block_type') === 'feedback_form'),

                        Toggle::make('is_visible')
                            ->label('Отображать блок на сайте')
                            ->default(true),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
