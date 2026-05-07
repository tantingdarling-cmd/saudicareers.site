<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketInsight extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'output_type',
        'category',
        'sentiment_label',
        'sentiment_score',
        'source',
        'radar_id',
        'radar_vector_id',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published'    => 'boolean',
        'sentiment_score' => 'float',
        'published_at'    => 'datetime',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('output_type', $type);
    }
}
