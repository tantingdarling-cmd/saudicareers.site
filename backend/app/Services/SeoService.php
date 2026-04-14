<?php

namespace App\Services;

use App\Models\Job;

/**
 * SeoService — مولّد بيانات Schema.org / JSON-LD
 *
 * الاستخدام في Controller:
 *   $jsonLd = app(SeoService::class)->jobPosting($job);
 *   return response()->json(['job' => $job, 'seo' => $jsonLd]);
 *
 * الاستخدام في Blade (إن احتجنا SSR مستقبلاً):
 *   {!! app(SeoService::class)->jobPostingTag($job) !!}
 */
class SeoService
{
    private const SITE_NAME = 'Saudi Careers';
    private const SITE_URL  = 'https://saudicareers.site';

    // ── عنوان ووصف تلقائيان (يُستخدمان إذا لم يُدخل الأدمن قيمة يدوياً) ───

    public function metaTitle(Job $job): string
    {
        if ($job->meta_title) {
            return $job->meta_title;
        }

        // القالب: [Job Title] في [Company] - [City] | سعودي كارييرز
        return sprintf('%s في %s - %s | %s', $job->title, $job->company, $job->location, self::SITE_NAME);
    }

    public function metaDescription(Job $job): string
    {
        if ($job->meta_description) {
            return $job->meta_description;
        }

        // القالب التلقائي (≤160 حرف للـ SERP snippet)
        return mb_substr(
            sprintf(
                'اكتشف فرصة عمل كـ %s في %s. قدّم الآن عبر منصة %s بوابتك للتوظيف في المملكة.',
                $job->title,
                $job->location,
                self::SITE_NAME
            ),
            0,
            160
        );
    }

    // ── JSON-LD: JobPosting (Google Jobs) ───────────────────────────────────

    public function jobPosting(Job $job): array
    {
        $schema = [
            '@context'          => 'https://schema.org',
            '@type'             => 'JobPosting',
            'title'             => $job->title,
            'description'       => $job->description,
            'datePosted'        => optional($job->posted_at)->toIso8601String()
                                    ?? $job->created_at->toIso8601String(),
            'hiringOrganization' => [
                '@type' => 'Organization',
                'name'  => $job->company,
                'logo'  => $job->company_logo
                    ? self::SITE_URL . '/storage/' . $job->company_logo
                    : self::SITE_URL . '/saudi.png',
            ],
            'jobLocation' => [
                '@type'   => 'Place',
                'address' => [
                    '@type'           => 'PostalAddress',
                    'addressLocality' => $job->location,
                    'addressCountry'  => 'SA',
                ],
            ],
            'employmentType' => $this->mapEmploymentType($job->job_type),
            'url'            => self::SITE_URL . '/jobs/' . $job->slug,
        ];

        // أضف نطاق الراتب فقط إذا كانت القيم موجودة (Google Jobs يُفضّله)
        if ($job->salary_min || $job->salary_max) {
            $schema['baseSalary'] = [
                '@type'    => 'MonetaryAmount',
                'currency' => $job->salary_currency ?? 'SAR',
                'value'    => [
                    '@type'    => 'QuantitativeValue',
                    'minValue' => $job->salary_min,
                    'maxValue' => $job->salary_max,
                    'unitText' => 'MONTH',
                ],
            ];
        }

        return $schema;
    }

    /**
     * نسخة جاهزة للحقن في <head> مباشرة.
     */
    public function jobPostingTag(Job $job): string
    {
        $json = json_encode($this->jobPosting($job), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        return "<script type=\"application/ld+json\">\n{$json}\n</script>";
    }

    // ── تحويل job_type → employmentType (Google Jobs values) ────────────────

    private function mapEmploymentType(string $type): string
    {
        return match ($type) {
            'full_time'  => 'FULL_TIME',
            'part_time'  => 'PART_TIME',
            'contract'   => 'CONTRACTOR',
            'internship' => 'INTERN',
            'remote'     => 'FULL_TIME',   // Google Jobs لا يملك REMOTE — يُضاف jobLocationType
            default      => 'OTHER',
        };
    }
}
