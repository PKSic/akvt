<?php

namespace App\Filament\Resources\NavigationMenus;

use App\Filament\Resources\NavigationMenus\Pages\CreateNavigationMenu;
use App\Filament\Resources\NavigationMenus\Pages\EditNavigationMenu;
use App\Filament\Resources\NavigationMenus\Pages\ListNavigationMenus;
use App\Filament\Resources\NavigationMenus\Schemas\NavigationMenuForm;
use App\Filament\Resources\NavigationMenus\Tables\NavigationMenusTable;
use App\Models\NavigationMenu;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class NavigationMenuResource extends Resource
{
    protected static ?string $modelLabel = 'Меню навигации';
    protected static ?string $pluralModelLabel = 'Меню навигации';
    protected static ?string $navigationLabel = 'Конструктор меню';
    protected static \UnitEnum|string|null $navigationGroup = 'Структура сайта';
    protected static ?string $model = NavigationMenu::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBars3;

    public static function form(Schema $schema): Schema
    {
        return NavigationMenuForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NavigationMenusTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNavigationMenus::route('/'),
            'create' => CreateNavigationMenu::route('/create'),
            'edit' => EditNavigationMenu::route('/{record}/edit'),
        ];
    }
}
