<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType    = 'string';
    public    $incrementing = false;

    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description', 'is_public'];

    protected $casts = ['is_public' => 'boolean'];

    // ── استرجاع قيمة محوّلة حسب النوع ──────────────────────────────

    public function getCastedValueAttribute(): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'number'  => is_numeric($this->value) ? $this->value + 0 : null,
            'json'    => json_decode($this->value, true),
            default   => $this->value,
        };
    }

    // ── استرجاع سريع بمفتاح واحد (مع Cache) ────────────────────────

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting:{$key}", 3600, function () use ($key, $default) {
            $setting = static::find($key);
            return $setting ? $setting->casted_value : $default;
        });
    }

    // ── مسح الـ cache عند التحديث ────────────────────────────────────

    protected static function booted(): void
    {
        static::saved(fn ($s) => Cache::forget("setting:{$s->key}"));
    }
}
