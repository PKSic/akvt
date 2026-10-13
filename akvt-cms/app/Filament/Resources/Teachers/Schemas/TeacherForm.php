<?php

namespace App\Filament\Resources\Teachers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class TeacherForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('full_name')
                    ->label('ФИО преподавателя')
                    ->required()
                    ->columnSpanFull(),
                FileUpload::make('photo_path')
                    ->label('Фотография')
                    ->directory('teachers')
                    ->image()
                    ->imageEditor(),
                TextInput::make('position')
                    ->label('Занимаемая должность')
                    ->required(),
                TextInput::make('education_level')
                    ->label('Уровень образования (высшее / СПО)'),
                TextInput::make('qualification')
                    ->label('Квалификация'),
                TextInput::make('total_experience_years')
                    ->label('Общий стаж работы (лет)')
                    ->numeric()
                    ->default(0),
                TextInput::make('ped_experience_years')
                    ->label('Педагогический стаж (лет)')
                    ->numeric()
                    ->default(0),
                Textarea::make('disciplines')
                    ->label('Преподаваемые дисциплины / МДК')
                    ->columnSpanFull(),
                Textarea::make('advanced_training')
                    ->label('Сведения о повышении квалификации и переподготовке')
                    ->columnSpanFull(),
                TextInput::make('sort_order')
                    ->label('Порядок сортировки')
                    ->numeric()
                    ->default(0),
            ]);
    }
}
