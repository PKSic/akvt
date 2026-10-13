<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NavigationMenuItem extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function menu()
    {
        return $this->belongsTo(NavigationMenu::class, 'menu_id');
    }
}
