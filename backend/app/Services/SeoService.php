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

    // خريطة experience_level → عدد الأشهر (OccupationalExperienceRequirements)
    private const EXPERIENCE_MONTHS = [
        'entry'     => 0,
        'junior'    => 12,
        'mid'       => 36,
        'senior'    => 60,
        'lead'      => 84,
        'executive' => 120,
    ];

    public function jobPosting(Job $job): array
    {
        // وصف كافٍ لـ Google Jobs (لا يقل عن 100 حرف)
        $description = $job->description;
        if (!$description || mb_strlen($description) < 100) {
            $parts = ["وظيفة {$job->title} في شركة {$job->company} بمدينة {$job->location}."];
            if ($job->job_type) $parts[] = "نوع الدوام: {$job->job_type}.";
            if ($job->experience_level) $parts[] = "مستوى الخبرة: {$job->experience_level}.";
            if ($job->requirements) $parts[] = 'المتطلبات: ' . mb_substr($job->requirements, 0, 300);
            $description = implode(' ', $parts);
        }

        $schema = [
            '@context'  => 'https://schema.org',
            '@type'     => 'JobPosting',
            // §Google: معرّف فريد يمنع التكرار في نتائج البحث
            'identifier' => [
                '@type' => 'PropertyValue',
                'name'  => self::SITE_NAME,
                'value' => (string) $job->id,
            ],
            'title'       => $job->title,
            'description' => $description,
            'datePosted'  => optional($job->posted_at)->toIso8601String()
                              ?? $job->created_at->toIso8601String(),
            'validThrough' => now()->addDays(30)->toIso8601String(),
            'hiringOrganization' => array_filter([
                '@type' => 'Organization',
                'name'  => $job->company,
                'logo'  => $job->company_logo
                    ? self::SITE_URL . '/storage/' . $job->company_logo
                    : null,
            ]),
            'jobLocation' => [
                '@type'   => 'Place',
                'address' => [
                    '@type'           => 'PostalAddress',
                    'addressLocality' => $job->location,
                    'addressCountry'  => 'SA',
                ],
            ],
            'employmentType'               => $this->mapEmploymentType($job->job_type),
            'applicantLocationRequirements' => ['@type' => 'Country', 'name' => 'Saudi Arabia'],
            // directApply: true فقط إذا كان apply_url خارجياً (لا يحتاج login)
            // false عند التقديم عبر الموقع لأنه يتطلب تسجيل دخول
            'directApply' => $job->apply_url ? true : false,
            'url'         => self::SITE_URL . '/jobs/' . ($job->slug ?? $job->id),
        ];

        // وظيفة عن بعد → jobLocationType بدلاً من REMOTE (Google لا يدعمها كـ employmentType)
        if ($job->job_type === 'remote') {
            $schema['jobLocationType'] = 'TELECOMMUTE';
        }

        // §Google: OccupationalExperienceRequirements بدلاً من string عادي
        if ($job->experience_level && isset(self::EXPERIENCE_MONTHS[$job->experience_level])) {
            $schema['experienceRequirements'] = [
                '@type'              => 'OccupationalExperienceRequirements',
                'monthsOfExperience' => self::EXPERIENCE_MONTHS[$job->experience_level],
            ];
        }

        // أضف المتطلبات والمسؤوليات إذا وجدت
        if ($job->requirements) {
            $reqs = explode("\n", $job->requirements);
            $schema['qualifications'] = array_slice(array_filter($reqs), 0, 10);
            $schema['skills'] = array_slice(array_filter($reqs), 0, 5);
        }

        // أضف نطاق الراتب فقط إذا كانت القيم موجودة (Google Jobs يُفضّله)
        if ($job->salary_min || $job->salary_max) {
            $schema['baseSalary'] = [
                '@type'    => 'MonetaryAmount',
                'currency' => $job->salary_currency ?? 'SAR',
                'value'    => [
                    '@type'    => 'QuantitativeValue',
                    'minValue' => $job->salary_min,
                    'maxValue' => $job->salary_max ?? $job->salary_min,
                    'unitText' => 'MONTH',
                ],
            ];
        }

        return $schema;
    }

    /**
     * بيانات الموقع العامة (Organization + WebSite) لتعزيز هوية المنصة في قوقل.
     */
    public function siteSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    '@id'   => self::SITE_URL . '/#organization',
                    'name'  => self::SITE_NAME,
                    'url'   => self::SITE_URL,
                    'logo'  => self::SITE_URL . '/logo.png',
                    'sameAs' => [
                        'https://twitter.com/saudicareers',
                        'https://linkedin.com/company/saudicareers'
                    ],
                    'contactPoint' => [
                        '@type' => 'ContactPoint',
                        'contactType' => 'customer support',
                        'email' => 'support@saudicareers.site'
                    ]
                ],
                [
                    '@type' => 'WebSite',
                    '@id'   => self::SITE_URL . '/#website',
                    'url'   => self::SITE_URL,
                    'name'  => self::SITE_NAME,
                    'publisher' => ['@id' => self::SITE_URL . '/#organization'],
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => self::SITE_URL . '/?q={search_term_string}',
                        'query-input' => 'required name=search_term_string'
                    ]
                ]
            ]
        ];
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
