<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Services\SeoService;
use Illuminate\Support\Facades\Cache;

/**
 * JobPageController — يخدم صفحات الوظائف كـ HTML جاهزة للـ Bots
 *
 * الفكرة:
 *  1. يقرأ React's index.html المبني من Vite (يحتوي على روابط الأصول الصحيحة)
 *  2. يستبدل الـ <title> ويحقن meta/JSON-LD خاصة بالوظيفة
 *  3. يُعيد HTML كامل → React تتولى التفاعل بعد التحميل
 *
 * النتيجة:
 *  - Bots (Google، WhatsApp، Twitter) ترى HTML كامل فوراً ← SEO ممتاز
 *  - المستخدم يرى React SPA كالمعتاد
 *
 * REACT_INDEX_PATH في .env:
 *  الإنتاج (Cloudways): /home/xxx/public_html/index.html
 *  محلياً (بعد npm build): مسار dist/index.html
 */
class JobPageController extends Controller
{
    private const SITE_URL  = 'https://saudicareers.site';
    private const SITE_NAME = 'سعودي كارييرز';

    public function show(string $idOrSlug, SeoService $seo)
    {
        // دعم الـ slug والـ id
        $job = Job::query()
            ->where('slug', $idOrSlug)
            ->orWhere('id', is_numeric($idOrSlug) ? (int)$idOrSlug : 0)
            ->firstOrFail();

        // ── قراءة index.html (مكتنزة 5 دقائق) ────────────────────
        $indexPath = config('app.react_index_path',
            base_path('../index.html')   // Cloudways: backend/../index.html = public_html/index.html
        );

        $html = Cache::remember('react_index_html', 300, function () use ($indexPath) {
            if (!file_exists($indexPath)) {
                abort(500, "React index.html not found at: {$indexPath}");
            }
            return file_get_contents($indexPath);
        });

        // ── بناء الـ Meta ───────────────────────────────────────────
        $title       = $seo->metaTitle($job);
        $description = $seo->metaDescription($job);
        $canonical   = self::SITE_URL . '/jobs/' . ($job->slug ?: $job->id);
        $ogImage     = self::SITE_URL . '/og/jobs/' . $job->id;

        $jsonLd = json_encode(
            $seo->jobPosting($job),
            JSON_UNESCAPED_UNICODE | JSON_HEX_TAG
        );

        $breadcrumb = json_encode([
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'الرئيسية',  'item' => self::SITE_URL],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'الوظائف',   'item' => self::SITE_URL . '/#jobs'],
                ['@type' => 'ListItem', 'position' => 3, 'name' => $job->title, 'item' => $canonical],
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);

        // ── بناء كتلة الـ meta ──────────────────────────────────────
        $salary = $job->salary_min
            ? number_format($job->salary_min) . ($job->salary_max ? '–' . number_format($job->salary_max) : '') . ' ر.س'
            : null;

        $metaBlock = implode("\n  ", array_filter([
            "<!-- ═══ Job-specific SEO (injected by Laravel) ═══ -->",
            "<meta property=\"og:type\"         content=\"article\" />",
            "<meta property=\"og:title\"        content=\"" . e($title) . "\" />",
            "<meta property=\"og:description\"  content=\"" . e($description) . "\" />",
            "<meta property=\"og:url\"          content=\"" . e($canonical) . "\" />",
            "<meta property=\"og:site_name\"    content=\"" . self::SITE_NAME . "\" />",
            "<meta property=\"og:image\"        content=\"" . e($ogImage) . "\" />",
            "<meta property=\"og:image:width\"  content=\"1200\" />",
            "<meta property=\"og:image:height\" content=\"630\" />",
            "<meta property=\"og:image:alt\"    content=\"" . e($job->title . ' — ' . $job->company) . "\" />",
            "<meta name=\"twitter:card\"        content=\"summary_large_image\" />",
            "<meta name=\"twitter:title\"       content=\"" . e($title) . "\" />",
            "<meta name=\"twitter:description\" content=\"" . e($description) . "\" />",
            "<meta name=\"twitter:image\"       content=\"" . e($ogImage) . "\" />",
            "<link rel=\"canonical\"            href=\"" . e($canonical) . "\" />",
            $salary ? "<meta name=\"salary\"   content=\"" . e($salary) . "\" />" : null,
            "<script type=\"application/ld+json\">{$jsonLd}</script>",
            "<script type=\"application/ld+json\">{$breadcrumb}</script>",
        ]));

        // ── حقن الـ meta في index.html ─────────────────────────────
        // 1. استبدال <title>
        $output = preg_replace(
            '/<title>[^<]*<\/title>/',
            '<title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title>',
            $html,
            1
        );

        // 2. استبدال description الافتراضي
        $output = preg_replace(
            '/<meta name="description"[^>]*>/i',
            '<meta name="description" content="' . e($description) . '" />',
            $output,
            1
        );

        // 3. حقن meta block قبل </head>
        $output = str_replace('</head>', "  {$metaBlock}\n</head>", $output);

        return response($output, 200)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=300, s-maxage=600')
            ->header('X-Robots-Tag', 'index, follow');
    }
}
