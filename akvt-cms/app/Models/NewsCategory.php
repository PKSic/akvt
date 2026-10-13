<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NewsCategory extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function posts()
    {
        return $this->hasMany(NewsPost::class, 'category_id')->orderByDesc('published_at');
    }
}
