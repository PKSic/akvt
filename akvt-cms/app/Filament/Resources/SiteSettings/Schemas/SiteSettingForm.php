<?php

namespace App\Filament\Resources\SiteSettings\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class SiteSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('key')
                    ->label('Ключ параметра (системный идентификатор)')
                    ->required(),
                Select::make('group')
                    ->label('Группа настроек')
                    ->options([
                        'general' => 'Общие данные и реквизиты',
                        'contacts' => 'Контакты и приемная комиссия',
                        'social' => 'Социальные сети',
                        'analytics' => 'Аналитика и счетчики (Яндекс.Метрика)',
                    ])
                    ->default('general')
                    ->required(),
                Textarea::make('value')
                    ->label('Значение настройки')
                    ->rows(4)
                    ->columnSpanFull(),
            ]);
    }
}
