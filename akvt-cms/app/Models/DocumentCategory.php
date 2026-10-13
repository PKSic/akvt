<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function documents()
    {
        return $this->hasMany(Document::class, 'category_id')->orderBy('sort_order');
    }
}
