<?php

namespace App\Filament\Resources\NavigationMenus\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class NavigationMenusTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Название меню')
                    ->searchable()
                    ->weight('bold'),
                TextColumn::make('code')
                    ->label('Код области темы')
                    ->badge()
                    ->color('info')
                    ->searchable(),
                TextColumn::make('items_count')
                    ->label('Количество ссылок')
                    ->counts('items')
                    ->badge()
                    ->color('success')
                    ->alignCenter(),
                TextColumn::make('updated_at')
                    ->label('Дата изменения')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
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
