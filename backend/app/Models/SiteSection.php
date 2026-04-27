<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSection extends Model
{
    protected $fillable = ['key', 'title', 'content', 'is_active', 'order'];

    protected $casts = [
        'content'   => 'array',
        'is_active' => 'boolean',
        'order'     => 'integer',
    ];
}
