<?php

namespace App\Filament\Resources\Redirects\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class RedirectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('old_url')
                    ->label('Исходный URL (старый WordPress адрес, напр. /2020/10/...)')
                    ->required(),
                TextInput::make('new_url')
                    ->label('Целевой URL (новый адрес на сайте, напр. /news/...)')
                    ->required(),
                TextInput::make('status_code')
                    ->label('HTTP-статус редиректа')
                    ->numeric()
                    ->default(301)
                    ->required(),
                TextInput::make('hit_count')
                    ->label('Количество переходов')
                    ->numeric()
                    ->default(0)
                    ->disabled(),
            ]);
    }
}
