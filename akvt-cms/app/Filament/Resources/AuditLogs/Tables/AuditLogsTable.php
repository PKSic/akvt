<?php

namespace App\Filament\Resources\AuditLogs\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AuditLogsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')
                    ->label('Дата и время')
                    ->dateTime('d.m.Y H:i:s')
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Пользователь')
                    ->searchable()
                    ->default('Система / Гость'),
                TextColumn::make('action')
                    ->label('Действие')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'created' => 'success',
                        'updated' => 'warning',
                        'deleted' => 'danger',
                        default => 'info',
                    })
                    ->searchable(),
                TextColumn::make('entity_type')
                    ->label('Раздел / Сущность')
                    ->searchable(),
                TextColumn::make('entity_id')
                    ->label('ID записи')
                    ->searchable(),
                TextColumn::make('ip_address')
                    ->label('IP-адрес')
                    ->searchable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([])
            ->toolbarActions([]);
    }
}
