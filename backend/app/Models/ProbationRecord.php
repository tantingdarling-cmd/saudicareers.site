<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ProbationRecord extends Model
{
    protected $fillable = [
        'employee_name',
        'employee_email',
        'application_id',
        'start_date',
        'duration_days',
        'extended',
        'extension_docs',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_date'    => 'date',
        'extended'      => 'boolean',
        'duration_days' => 'integer',
    ];

    // ── نظام العمل السعودي — المادة 53 ─────────────────────────────────────
    // الحد الأقصى للمدة الأصلية 90 يوماً، وللمدة الممتدة 180 يوماً
    public const MAX_DAYS          = 90;   // Art.53: الحد الأصلي
    public const MAX_EXTENDED_DAYS = 180;  // Art.53: الحد بعد التمديد

    // ── العلاقات ─────────────────────────────────────────────────────────────

    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'application_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── الحسابات ─────────────────────────────────────────────────────────────

    /**
     * تاريخ انتهاء فترة التجربة بناءً على start_date + duration_days.
     */
    public function getEndDateAttribute(): Carbon
    {
        return $this->start_date->addDays($this->duration_days);
    }

    /**
     * الأيام المتبقية حتى نهاية فترة التجربة (0 إذا انتهت).
     */
    public function getRemainingDaysAttribute(): int
    {
        $remaining = (int) now()->startOfDay()->diffInDays($this->end_date, false);
        return max(0, $remaining);
    }

    /**
     * نسبة التقدم في فترة التجربة (0–100).
     */
    public function getProgressPercentAttribute(): int
    {
        $elapsed = $this->start_date->diffInDays(now());
        return min(100, (int) round(($elapsed / $this->duration_days) * 100));
    }

    /**
     * هل مرّت المدة؟
     */
    public function isExpired(): bool
    {
        return now()->isAfter($this->end_date);
    }

    /**
     * هل يمكن التمديد؟
     * — نظام العمل المادة 53: مرة واحدة فقط، ضمن 180 يوماً إجمالاً
     */
    public function canExtend(): bool
    {
        return ! $this->extended
            && in_array($this->status, ['active'])
            && $this->duration_days < self::MAX_EXTENDED_DAYS;
    }
}
