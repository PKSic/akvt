<?php

namespace App\Filament\Resources\Redirects\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RedirectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('old_url')
                    ->label('Исходный URL (WordPress)')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('new_url')
                    ->label('Целевой URL (Новый стек)')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('status_code')
                    ->label('Код')
                    ->badge()
                    ->color('success'),
                TextColumn::make('hit_count')
                    ->label('Переходов')
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
