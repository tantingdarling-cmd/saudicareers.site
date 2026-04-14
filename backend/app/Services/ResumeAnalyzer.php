<?php

namespace App\Services;

use Smalot\PdfParser\Parser;

/**
 * §10: ATS Resume Analyzer — Phase 1 (PDF only).
 *
 * Scoring weights:
 *   Contact info present   → +25 pts
 *   Standard headings      → +30 pts
 *   Keyword density        → up to +30 pts (density × 100, capped at 30)
 *   Base score             → +15 pts
 *
 * Total is clamped to [0, 100].
 *
 * §11 Gotcha: smalot/pdfparser holds the full PDF in memory.
 *   Keep file limit at 2MB and delete the temp file immediately after parsing.
 */
class ResumeAnalyzer
{
    // Common ATS keywords — both English and Arabic variants
    private const KEYWORDS = [
        'LEADERSHIP', 'MANAGEMENT', 'ANALYSIS', 'DEVELOPMENT',
        'COMMUNICATION', 'PROBLEM SOLVING', 'TEAMWORK', 'STRATEGY',
        'قيادة', 'إدارة', 'تحليل', 'تطوير', 'تواصل', 'فريق',
    ];

    // Standard section headings (ATS expects these)
    private const HEADINGS_PATTERN =
        '/\b(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|OBJECTIVE|' .
        'خبرة|تعليم|مهارات|مشاريع|ملخص)\b/ui';

    private Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    public function analyze(string $pdfPath): array
    {
        $text = $this->extractText($pdfPath);

        $hasContact        = $this->checkContact($text);
        $hasHeadings       = $this->checkHeadings($text);
        $keywords          = $this->checkKeywords($text);
        $wordCount         = str_word_count($text);

        // Build passed / failed lists
        $passed = [];
        $failed = [];
        foreach ([
            'has_contact'       => $hasContact,
            'standard_headings' => $hasHeadings,
            'good_keywords'     => $keywords['density'] > 0.03,
        ] as $check => $result) {
            $result ? ($passed[] = $check) : ($failed[] = $check);
        }

        // Score: base 15 + contact 25 + headings 30 + keyword component (max 30)
        $keywordPoints = (int) min(30, $keywords['density'] * 100);
        $score = (int) max(0, min(100,
            15 +
            ($hasContact  ? 25 : 0) +
            ($hasHeadings ? 30 : 0) +
            $keywordPoints
        ));

        return [
            'score'           => $score,
            'passed'          => $passed,
            'failed'          => $failed,
            'recommendations' => $this->buildTips($hasContact, $hasHeadings, $keywords, $wordCount),
            'cta'             => 'upgrade_for_full_report',
        ];
    }

    // ── Private helpers ──────────────────────────────────────────────

    private function extractText(string $pdfPath): string
    {
        try {
            $pdf = $this->parser->parseFile($pdfPath);
            return $pdf->getText();
        } catch (\Throwable $e) {
            // If parsing fails, return empty string — analyzer will give low score
            return '';
        }
    }

    private function checkContact(string $text): bool
    {
        return (bool) preg_match(
            '/[\w.\-]+@[\w.\-]+\.[a-z]{2,}|\+?[\d\s\-]{9,15}/i',
            $text
        );
    }

    private function checkHeadings(string $text): bool
    {
        return (bool) preg_match(self::HEADINGS_PATTERN, $text);
    }

    private function checkKeywords(string $text): array
    {
        $upper = mb_strtoupper($text);
        $found = array_filter(
            self::KEYWORDS,
            fn ($k) => str_contains($upper, mb_strtoupper($k))
        );

        return [
            'found'   => array_values($found),
            'missing' => array_values(array_diff(self::KEYWORDS, $found)),
            'density' => count($found) / count(self::KEYWORDS),
        ];
    }

    private function buildTips(bool $hasContact, bool $hasHeadings, array $keywords, int $wordCount): array
    {
        $tips = [];

        if (!$hasContact) {
            $tips[] = 'أضف بريدك الإلكتروني ورقم هاتفك بوضوح في أعلى الصفحة.';
        }

        if (!$hasHeadings) {
            $tips[] = 'استخدم عناوين قياسية مثل: Experience, Education, Skills — أنظمة ATS تبحث عنها تحديداً.';
        }

        if ($wordCount < 150) {
            $tips[] = 'السيرة قصيرة جداً. أضف تفاصيل عن مشاريعك وإنجازاتك الفعلية.';
        }

        if ($keywords['density'] < 0.03) {
            $sample = implode('، ', array_slice($keywords['missing'], 0, 3));
            $tips[] = "أضف كلمات مفتاحية شائعة في مجالك مثل: {$sample}.";
        }

        return $tips ?: ['السيرة جيدة بشكل عام. احصل على التقرير الكامل لترى نقاط التحسين الدقيقة.'];
    }
}
