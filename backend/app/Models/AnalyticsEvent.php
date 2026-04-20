<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'event_type', 'campaign', 'created_at'];

    public static function log(string $event, ?int $userId = null, ?string $campaign = null): void
    {
        static::create([
            'event_type' => $event,
            'user_id'    => $userId,
            'campaign'   => $campaign,
            'created_at' => now(),
        ]);
    }
}
