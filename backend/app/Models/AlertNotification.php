<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertNotification extends Model
{
    protected $fillable = [
        'user_id', 'job_id', 'job_alert_id',
        'job_title', 'company', 'location', 'alert_keyword', 'read_at',
    ];

    protected $casts = ['read_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function job()  { return $this->belongsTo(Job::class); }
}
