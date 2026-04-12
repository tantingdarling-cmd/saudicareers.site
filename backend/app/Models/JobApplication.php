<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'name',
        'email',
        'phone',
        'cv_path',
        'cover_letter',
        'linkedin_url',
        'portfolio_url',
        'status',
        'notes',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'pending' => 'قيد المراجعة',
            'reviewed' => 'تم المراجعة',
            'interview' => 'مقابلة',
            'rejected' => 'مرفوض',
            'accepted' => 'تم القبول',
            default => 'غير محدد',
        };
    }
}
