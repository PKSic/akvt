<?php

namespace App\Filament\Resources\Specialties\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SpecialtyForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('code')
                    ->label('Код специальности / профессии (напр. 09.02.07)')
                    ->required(),
                TextInput::make('name')
                    ->label('Наименование образовательной программы')
                    ->required(),
                TextInput::make('study_period')
                    ->label('Срок обучения (напр. 3 года 10 месяцев)'),
                TextInput::make('budget_places')
                    ->label('Количество бюджетных мест')
                    ->numeric()
                    ->default(0),
                TextInput::make('contract_places')
                    ->label('Количество платных (коммерческих) мест')
                    ->numeric()
                    ->default(0),
                TextInput::make('detail_page_url')
                    ->label('Ссылка на подробную страницу программы')
                    ->url(),
                TextInput::make('sort_order')
                    ->label('Порядок сортировки')
                    ->numeric()
                    ->default(0),
            ]);
    }
}
