<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Setting;

/**
 * MatchService — نظام المطابقة الذكية (v1.0)
 *
 * يحسب درجة توافق طلب التقديم مع الوظيفة عبر 7 أبعاد مرجّحة.
 * الأوزان تُسحب من جدول settings لتُعدَّل من لوحة التحكم.
 *
 * PDPL: لا يُحفظ أي PII في match_details — فقط النتيجة والأبعاد.
 */
class MatchService
{
    // ── مفاتيح Keywords لكل مستوى خبرة ─────────────────────────────

    private const EXPERIENCE_SIGNALS = [
        'entry'     => ['مبتدئ', 'حديث التخرج', 'junior', 'entry', 'fresh graduate', 'intern', 'تدريب'],
        'mid'       => ['متوسط', 'خبرة', 'سنوات', 'mid', 'years', 'experienced', 'professional'],
        'senior'    => ['كبير', 'خبير', 'senior', 'specialist', 'expert', 'متخصص', 'محترف'],
        'lead'      => ['قائد', 'مشرف', 'lead', 'supervisor', 'team lead', 'مدير فريق'],
        'executive' => ['مدير', 'رئيس', 'director', 'executive', 'head of', 'VP', 'نائب'],
    ];

    private const JOB_TYPE_SIGNALS = [
        'full_time'  => ['دوام كامل', 'full time', 'fulltime', 'full-time', 'وقت كامل'],
        'part_time'  => ['دوام جزئي', 'part time', 'parttime', 'part-time', 'وقت جزئي'],
        'remote'     => ['عن بعد', 'remote', 'work from home', 'من المنزل', 'remotely'],
        'contract'   => ['عقد', 'contract', 'freelance', 'مستقل', 'مؤقت'],
        'internship' => ['تدريب', 'intern', 'internship', 'تدريبي', 'تطوعي'],
    ];

    private const EDUCATION_KEYWORDS = [
        'بكالوريوس', 'bachelor', 'ماجستير', 'master', 'mba', 'دكتوراه', 'phd', 'doctorate',
        'دبلوم', 'diploma', 'شهادة', 'certificate', 'certification', 'زمالة', 'fellowship',
        'هندسة', 'engineering', 'علوم حاسب', 'computer science', 'تقنية معلومات', 'information technology',
        'محاسبة', 'accounting', 'تمويل', 'finance', 'إدارة أعمال', 'business administration',
    ];

    private const CATEGORY_KEYWORDS = [
        'tech'         => ['تقنية', 'برمجة', 'software', 'developer', 'كود', 'قاعدة بيانات', 'database', 'cloud', 'devops', 'سحابة'],
        'finance'      => ['مالية', 'محاسبة', 'تدقيق', 'finance', 'accounting', 'audit', 'tax', 'ضريبة', 'ميزانية', 'budget'],
        'energy'       => ['طاقة', 'نفط', 'غاز', 'energy', 'oil', 'gas', 'أرامكو', 'aramco', 'كهرباء', 'electricity'],
        'construction' => ['إنشاء', 'هندسة', 'مقاولات', 'construction', 'engineering', 'مشاريع', 'project', 'معماري'],
        'hr'           => ['موارد بشرية', 'توظيف', 'hr', 'human resources', 'recruitment', 'تدريب', 'training', 'رواتب'],
        'marketing'    => ['تسويق', 'إعلان', 'marketing', 'advertising', 'social media', 'سوشيال', 'brand', 'علامة تجارية'],
        'healthcare'   => ['صحة', 'طب', 'health', 'medical', 'doctor', 'nurse', 'دواء', 'مستشفى', 'hospital'],
        'education'    => ['تعليم', 'تدريس', 'education', 'teacher', 'training', 'أكاديمي', 'academic', 'مناهج'],
    ];

    // ── الواجهة الرئيسية ─────────────────────────────────────────────

    /**
     * احسب درجة مطابقة طلب التقديم مع الوظيفة.
     *
     * @param Job   $job
     * @param array $application  ['cover_letter', 'phone', 'cv_path', 'linkedin_url', 'portfolio_url']
     * @return array ['score' => float, 'details' => array, 'tier' => string]
     */
    public function score(Job $job, array $application): array
    {
        $weights = $this->loadWeights();

        $coverLetter = mb_strtolower($application['cover_letter'] ?? '');
        $jobText     = mb_strtolower(
            $job->title . ' ' . $job->description . ' ' . $job->requirements
        );

        // ── البُعد 1: المهارات (Keyword overlap) ───────────────────
        $skillsScore = $this->keywordOverlapScore($jobText, $coverLetter);

        // ── البُعد 2: الخبرة ────────────────────────────────────────
        $experienceScore = $this->experienceScore($job->experience_level, $coverLetter);

        // ── البُعد 3: الموقع ────────────────────────────────────────
        $locationScore = $this->locationScore($job->location, $coverLetter);

        // ── البُعد 4: نوع الدوام ────────────────────────────────────
        $jobTypeScore = $this->jobTypeScore($job->job_type, $coverLetter);

        // ── البُعد 5: التعليم ───────────────────────────────────────
        $educationScore = $this->keywordsPresenceScore(self::EDUCATION_KEYWORDS, $coverLetter);

        // ── البُعد 6: القطاع ────────────────────────────────────────
        $categoryScore = $this->categoryScore($job->category, $coverLetter);

        // ── البُعد 7: اكتمال الطلب ──────────────────────────────────
        $completenessScore = $this->completenessScore($application);

        // ── الدرجة الإجمالية المرجّحة ────────────────────────────────
        $raw = (
            $skillsScore      * $weights['skills']      +
            $experienceScore  * $weights['experience']  +
            $locationScore    * $weights['location']    +
            $jobTypeScore     * $weights['job_type']    +
            $educationScore   * $weights['education']   +
            $categoryScore    * $weights['category']    +
            $completenessScore * $weights['completeness']
        );

        $score = round(min(100, $raw * 100), 2);

        // ── PDPL: match_details لا تحتوي أي PII ─────────────────────
        $details = [
            'skills'       => round($skillsScore * 100, 1),
            'experience'   => round($experienceScore * 100, 1),
            'location'     => round($locationScore * 100, 1),
            'job_type'     => round($jobTypeScore * 100, 1),
            'education'    => round($educationScore * 100, 1),
            'category'     => round($categoryScore * 100, 1),
            'completeness' => round($completenessScore * 100, 1),
            'weights_used' => $weights,
        ];

        return [
            'score'   => $score,
            'details' => $details,
            'tier'    => $this->tier($score, (float) Setting::get('ai.hql_threshold', 80)),
        ];
    }

    // ── الأبعاد الفردية ─────────────────────────────────────────────

    /**
     * تطابق الكلمات المفتاحية: ما نسبة كلمات الوظيفة الموجودة في رسالة التقديم؟
     */
    private function keywordOverlapScore(string $jobText, string $appText): float
    {
        if (empty($appText)) return 0.0;

        // استخرج كلمات الوظيفة الفريدة (≥ 3 أحرف)
        preg_match_all('/[\p{Arabic}\p{L}]{3,}/u', $jobText, $jobWords);
        $jobWords = array_unique($jobWords[0] ?? []);

        if (empty($jobWords)) return 0.0;

        $matches = 0;
        foreach ($jobWords as $word) {
            if (mb_strpos($appText, $word) !== false) {
                $matches++;
            }
        }

        return min(1.0, $matches / max(1, count($jobWords)));
    }

    private function experienceScore(string $required, string $appText): float
    {
        $signals = self::EXPERIENCE_SIGNALS[$required] ?? [];
        if (empty($signals)) return 0.5; // لا يمكن التحقق → درجة محايدة

        foreach ($signals as $signal) {
            if (mb_strpos($appText, mb_strtolower($signal)) !== false) return 1.0;
        }

        return 0.2; // لم يُذكر مستوى الخبرة
    }

    private function locationScore(string $jobLocation, string $appText): float
    {
        $location = mb_strtolower($jobLocation);
        if (mb_strpos($appText, $location) !== false) return 1.0;

        // استخرج أسماء المدن الرئيسية
        $cities = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'أبها', 'تبوك', 'riyadh', 'jeddah', 'mecca', 'dammam'];
        foreach ($cities as $city) {
            if (mb_strpos($location, $city) !== false && mb_strpos($appText, $city) !== false) return 1.0;
        }

        return 0.3; // لم يُذكر الموقع
    }

    private function jobTypeScore(string $jobType, string $appText): float
    {
        $signals = self::JOB_TYPE_SIGNALS[$jobType] ?? [];
        if (empty($signals) || empty($appText)) return 0.5;

        foreach ($signals as $signal) {
            if (mb_strpos($appText, mb_strtolower($signal)) !== false) return 1.0;
        }

        return 0.4;
    }

    private function educationScore(string $appText): float
    {
        return $this->keywordsPresenceScore(self::EDUCATION_KEYWORDS, $appText);
    }

    private function categoryScore(string $category, string $appText): float
    {
        $keywords = self::CATEGORY_KEYWORDS[$category] ?? [];
        return $this->keywordsPresenceScore($keywords, $appText);
    }

    private function completenessScore(array $application): float
    {
        $score = 0.0;
        if (!empty($application['cv_path']))      $score += 0.50;
        if (!empty($application['cover_letter'])) $score += 0.30;
        if (!empty($application['phone']))        $score += 0.15;
        if (!empty($application['linkedin_url'])) $score += 0.05;
        return min(1.0, $score);
    }

    private function keywordsPresenceScore(array $keywords, string $text): float
    {
        if (empty($text) || empty($keywords)) return 0.0;
        $found = 0;
        foreach ($keywords as $kw) {
            if (mb_strpos($text, mb_strtolower($kw)) !== false) $found++;
        }
        return min(1.0, $found / max(1, ceil(count($keywords) * 0.2)));
    }

    // ── تحديد الـ Tier ───────────────────────────────────────────────

    public function tier(float $score, float $hqlThreshold = 80): string
    {
        if ($score >= $hqlThreshold) return 'high';
        if ($score >= 50)            return 'medium';
        return 'low';
    }

    // ── تحميل الأوزان من الـ Settings ───────────────────────────────

    private function loadWeights(): array
    {
        $weights = [
            'skills'       => (float) Setting::get('ai.weight_skills',       0.35),
            'experience'   => (float) Setting::get('ai.weight_experience',    0.25),
            'location'     => (float) Setting::get('ai.weight_location',      0.15),
            'job_type'     => (float) Setting::get('ai.weight_job_type',      0.10),
            'education'    => (float) Setting::get('ai.weight_education',     0.07),
            'category'     => (float) Setting::get('ai.weight_category',      0.05),
            'completeness' => (float) Setting::get('ai.weight_completeness',  0.03),
        ];

        // تطبيع: إذا لم تجمع 1.0 بسبب تعديلات يدوية، نُعيد توزيعها
        $sum = array_sum($weights);
        if ($sum > 0 && abs($sum - 1.0) > 0.01) {
            foreach ($weights as $k => $v) {
                $weights[$k] = $v / $sum;
            }
        }

        return $weights;
    }
}
