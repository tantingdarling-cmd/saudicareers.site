<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'company',
        'company_logo',
        'location',
        'salary_min',
        'salary_max',
        'description',
        'requirements',
        'category',
        'job_type',
        'experience_level',
        'is_active',
        'is_featured',
        'apply_url',
        'posted_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'posted_at' => 'datetime',
        'salary_min' => 'integer',
        'salary_max' => 'integer',
    ];

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
