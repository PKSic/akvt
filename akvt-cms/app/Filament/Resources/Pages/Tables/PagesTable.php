<?php

namespace App\Filament\Resources\Pages\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Заголовок страницы')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('slug')
                    ->label('Слаг (URL)')
                    ->searchable(),
                TextColumn::make('blocks_count')
                    ->counts('blocks')
                    ->label('Блоков в конструкторе')
                    ->badge()
                    ->color('info'),
                IconColumn::make('is_active')
                    ->label('Опубликована')
                    ->boolean(),
                IconColumn::make('is_ros_obr_nadzor')
                    ->label('Рособрнадзор')
                    ->boolean(),
                TextColumn::make('published_at')
                    ->label('Дата публикации')
                    ->dateTime('d.m.Y')
                    ->sortable(),
            ])
            ->defaultSort('sort_order', 'asc')
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
