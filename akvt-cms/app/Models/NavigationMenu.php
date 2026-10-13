<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NavigationMenu extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(NavigationMenuItem::class, 'menu_id')->orderBy('sort_order');
    }
}
