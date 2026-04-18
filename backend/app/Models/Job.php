<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'slug',
        'company',
        'company_logo',
        'location',
        'salary_min',
        'salary_max',
        'salary_currency',
        'meta_title',
        'meta_description',
        'description',
        'requirements',
        'category',
        'job_type',
        'experience_level',
        'is_active',
        'is_featured',
        'apply_url',
        'posted_at',
        'company_id',
        'post_status',
        'user_id',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_featured' => 'boolean',
        'posted_at'  => 'datetime',
        'salary_min' => 'integer',
        'salary_max' => 'integer',
    ];

    /**
     * أنشئ slug تلقائياً عند الحفظ إذا لم يكن موجوداً.
     * الأولوية: title_en → title (عربي → latin transliteration بسيطة → id fallback)
     */
    protected static function booted(): void
    {
        static::creating(function (Job $job) {
            if (empty($job->slug)) {
                $job->slug = static::generateUniqueSlug($job);
            }
        });

        static::updating(function (Job $job) {
            // إذا تغيّر title_en → أعد توليد الـ slug (الـ Controller يتحكم في هذا القرار)
            // لا نُغيّر تلقائياً لتجنب كسر الروابط المُفهرسة
        });
    }

    public static function generateUniqueSlug(Job $job): string
    {
        if ($job->title_en) {
            // عنوان إنجليزي → slug لاتيني قياسي
            $titlePart    = Str::slug($job->title_en);
            $locationPart = $job->location ? '-' . Str::slug($job->location) : '';
        } else {
            // عنوان عربي → احتفظ بالحروف العربية واستبدل المسافات بـ hyphens
            // مثال: "محاسب نظم" في "الرياض" → "محاسب-نظم-الرياض"
            $clean        = preg_replace('/[^\p{Arabic}\p{L}\p{N}\s]/u', '', $job->title ?? '');
            $titlePart    = preg_replace('/\s+/', '-', mb_trim($clean));
            $titlePart    = $titlePart ?: 'job';

            $locClean     = preg_replace('/[^\p{Arabic}\p{L}\p{N}\s]/u', '', $job->location ?? '');
            $locationPart = $locClean ? '-' . preg_replace('/\s+/', '-', mb_trim($locClean)) : '';
        }

        $base = $titlePart . $locationPart;
        $slug = $base;
        $i    = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
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
