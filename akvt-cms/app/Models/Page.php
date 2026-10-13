<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'seo_meta' => 'array',
        'is_active' => 'boolean',
        'is_ros_obr_nadzor' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function blocks()
    {
        return $this->hasMany(PageBlock::class, 'page_id')->orderBy('sort_order');
    }

    public function parent()
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Page::class, 'parent_id')->orderBy('sort_order');
    }
}
