<?php

namespace App\Filament\Resources\NewsPosts\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class NewsPostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->label('Рубрика')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
                TextInput::make('title')
                    ->label('Заголовок новости')
                    ->required()
                    ->live(onBlur: true)
                    ->columnSpanFull(),
                TextInput::make('slug')
                    ->label('URL (слаг статьи)')
                    ->required(),
                DateTimePicker::make('published_at')
                    ->label('Дата публикации')
                    ->default(now()),
                FileUpload::make('cover_image')
                    ->label('Обложка новости')
                    ->image()
                    ->directory('news/covers')
                    ->columnSpanFull(),
                Textarea::make('excerpt')
                    ->label('Краткий анонс статьи')
                    ->columnSpanFull(),
                RichEditor::make('content_html')
                    ->label('Текст статьи (WYSIWYG редактор без мусорных шорткодов)')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('is_published')
                    ->label('Опубликовано')
                    ->default(true),
            ]);
    }
}
