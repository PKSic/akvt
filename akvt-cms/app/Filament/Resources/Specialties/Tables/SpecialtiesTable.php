<?php

namespace App\Filament\Resources\Specialties\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SpecialtiesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')
                    ->label('Код специальности')
                    ->badge()
                    ->color('primary')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('name')
                    ->label('Наименование образовательной программы')
                    ->searchable()
                    ->weight('bold')
                    ->wrap(),
                TextColumn::make('study_period')
                    ->label('Срок обучения')
                    ->searchable(),
                TextColumn::make('budget_places')
                    ->label('Бюджетных мест')
                    ->numeric()
                    ->alignCenter()
                    ->sortable(),
                TextColumn::make('contract_places')
                    ->label('Платных мест')
                    ->numeric()
                    ->alignCenter()
                    ->sortable(),
            ])
            ->defaultSort('sort_order', 'asc')
            ->recordActions([
                EditAction::make()->label('Изменить'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
