<?php

namespace App\Filament\Resources\Documents\Schemas;

use App\Models\DocumentCategory;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class DocumentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category_id')
                    ->label('Категория документа')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload()
                    ->createOptionForm([
                        TextInput::make('name')->required()->label('Название категории'),
                        TextInput::make('slug')->required()->label('Слаг (URL)'),
                    ]),
                TextInput::make('title')
                    ->label('Наименование документа')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('reg_number')
                    ->label('Регистрационный номер / Приказ №'),
                DatePicker::make('approved_date')
                    ->label('Дата утверждения'),
                FileUpload::make('file_path')
                    ->label('Файл документа (PDF)')
                    ->directory('documents')
                    ->acceptedFileTypes(['application/pdf'])
                    ->maxSize(51200) // 50MB
                    ->required(),
                TextInput::make('file_size')
                    ->label('Размер файла (напр. 2.4 МБ)'),

                // Секция ЭЦП (Федеральный закон № 63-ФЗ)
                FileUpload::make('sig_file_path')
                    ->label('Файл электронной подписи (.sig)')
                    ->directory('documents/sig')
                    ->maxSize(1024),
                TextInput::make('sig_owner')
                    ->label('Владелец ЭЦП (ФИО, должность руководителя)'),
                DatePicker::make('sig_valid_to')
                    ->label('Срок действия сертификата ЭЦП'),
                TextInput::make('sig_cert_key')
                    ->label('Отпечаток / серийный номер сертификата'),

                Toggle::make('is_active')
                    ->label('Отображать на сайте')
                    ->default(true),
                TextInput::make('sort_order')
                    ->label('Порядок сортировки')
                    ->numeric()
                    ->default(0),
            ]);
    }
}
