<?php

namespace App\Filament\Resources\Teachers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TeachersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')
                    ->label('ФИО преподавателя')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('position')
                    ->label('Должность')
                    ->badge()
                    ->color('info')
                    ->searchable(),
                TextColumn::make('education_level')
                    ->label('Образование')
                    ->limit(45)
                    ->tooltip(fn ($record) => $record->education_level),
                TextColumn::make('disciplines')
                    ->label('Дисциплины')
                    ->limit(40)
                    ->tooltip(fn ($record) => $record->disciplines),
                TextColumn::make('total_experience_years')
                    ->label('Стаж (лет)')
                    ->suffix(' лет')
                    ->numeric()
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
