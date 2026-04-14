<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class JobApplication extends Model
{
    use HasFactory, Notifiable;

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
        'ai_consent',
        'match_score',
        'match_details',
        'applied_at',
    ];

    protected $casts = [
        'applied_at'     => 'datetime',
        'ai_consent'     => 'boolean',
        'match_score'    => 'float',
        'match_details'  => 'array',
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
