<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Support\Facades\Cache;

/**
 * OgImageController — يولّد صور OG ديناميكية لكل وظيفة
 *
 * الأبعاد: 1200 × 630 px (معيار Open Graph)
 * التقنية: PHP GD + FreeType
 *
 * ┌──────────────────────────────────────────────┐  0
 * │ ██ شريط أخضر 8px                            │  8
 * │                                              │
 * │  [SC]  saudicareers.site         [حصرية؟]   │  30–80
 * │ ─────────────────────────────────────────    │  90
 * │                                              │
 * │         [ فئة الوظيفة ]                     │  115–153
 * │                                              │
 * │       مسمى الوظيفة (السطر 1)                │  190
 * │       مسمى الوظيفة (السطر 2 إن طال)        │  248
 * │                                              │
 * │       اسم الشركة  ·  المدينة                │  310
 * │                                              │
 * │       💰 xx,xxx – xx,xxx ر.س شهرياً         │  375
 * │                                              │
 * │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  480
 * │  قدّم الآن ← saudicareers.site              │  550
 * └──────────────────────────────────────────────┘  630
 *
 * لتفعيل الخط العربي:
 *   1. نزّل: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
 *   2. ضع الملف في: backend/resources/fonts/NotoSansArabic-Regular.ttf
 *   3. نزّل أيضاً: NotoSansArabic-Bold.ttf لعناوين الوظائف
 */
class OgImageController extends Controller
{
    private const W = 1200;
    private const H = 630;

    // ── Grid ────────────────────────────────────────────────────────
    private const PAD        = 72;   // هامش أفقي للبطاقة
    private const CARD_TOP   = 24;
    private const CARD_BOT   = 606;  // H - 24

    // ── Y positions (baseline للنص imagettftext) ────────────────────
    private const Y_TOPBAR   = 8;
    private const Y_LOGO     = 70;   // baseline الـ logo text
    private const Y_HSEP     = 92;   // خط فاصل أفقي
    private const Y_CAT_TOP  = 112;
    private const Y_CAT_BOT  = 152;
    private const Y_CAT_TEXT = 142;  // baseline النص داخل pill الفئة
    private const Y_TITLE1   = 240;  // baseline السطر الأول للعنوان
    private const Y_TITLE2   = 298;  // baseline السطر الثاني (إن وُجد)
    private const Y_META     = 358;  // baseline الشركة · المدينة
    private const Y_SALARY   = 418;  // baseline الراتب
    private const Y_FSEP     = 490;  // خط فاصل سفلي
    private const Y_CTA      = 560;  // baseline نص الـ CTA

    // ── ألوان ────────────────────────────────────────────────────────
    private const C_BG       = [  0,  30,  20];  // #001E14 خلفية
    private const C_CARD     = [  0,  50,  34];  // #003222 بطاقة
    private const C_GREEN    = [ 29, 125,  75];  // #1D7D4B أخضر
    private const C_LGREENB  = [ 20,  80,  50];  // #145032 حدود بطاقة
    private const C_GOLD     = [197, 160,  89];  // #C5A059 ذهبي
    private const C_WHITE    = [255, 255, 255];
    private const C_SILVER   = [180, 210, 190];  // رمادي مخضر للنصوص الثانوية
    private const C_DARK_TXT = [  0,  30,  20];  // نص داكن على خلفية فاتحة

    // ── تصنيفات ──────────────────────────────────────────────────────
    private const CAT_LABELS = [
        'tech'         => ['label' => 'تقنية',          'bg' => [20, 90, 140], 'em' => '💻'],
        'finance'      => ['label' => 'مالية ومحاسبة',  'bg' => [100, 70, 20], 'em' => '🏦'],
        'energy'       => ['label' => 'طاقة ونفط',      'bg' => [80, 50, 10],  'em' => '⚡'],
        'construction' => ['label' => 'هندسة وإنشاء',   'bg' => [60, 40, 10],  'em' => '🏗️'],
        'hr'           => ['label' => 'موارد بشرية',    'bg' => [80, 20, 80],  'em' => '👥'],
        'marketing'    => ['label' => 'تسويق وإعلان',   'bg' => [140, 20, 20], 'em' => '📣'],
        'healthcare'   => ['label' => 'رعاية صحية',     'bg' => [20, 100, 80], 'em' => '🏥'],
        'education'    => ['label' => 'تعليم وتدريب',   'bg' => [20, 60, 120], 'em' => '🎓'],
    ];

    // ════════════════════════════════════════════════════════════════
    // Public
    // ════════════════════════════════════════════════════════════════

    public function job(int $id)
    {
        $imageData = Cache::remember("og_job_{$id}", 3600, function () use ($id) {
            return $this->generate(Job::findOrFail($id));
        });

        return response($imageData, 200)
            ->header('Content-Type',           'image/png')
            ->header('Cache-Control',           'public, max-age=3600, s-maxage=7200')
            ->header('X-Content-Type-Options', 'nosniff');
    }

    public static function clearCache(int $id): void
    {
        Cache::forget("og_job_{$id}");
    }

    // ════════════════════════════════════════════════════════════════
    // Core
    // ════════════════════════════════════════════════════════════════

    private function generate(Job $job): string
    {
        $img = imagecreatetruecolor(self::W, self::H);
        imagesavealpha($img, true);

        // ── تخصيص الألوان ────────────────────────────────────────────
        $cBg      = $this->rgb($img, self::C_BG);
        $cCard    = $this->rgb($img, self::C_CARD);
        $cGreen   = $this->rgb($img, self::C_GREEN);
        $cBorder  = $this->rgb($img, self::C_LGREENB);
        $cGold    = $this->rgb($img, self::C_GOLD);
        $cWhite   = $this->rgb($img, self::C_WHITE);
        $cSilver  = $this->rgb($img, self::C_SILVER);

        // ── خلفية ────────────────────────────────────────────────────
        imagefilledrectangle($img, 0, 0, self::W, self::H, $cBg);

        // ── بطاقة مع حدود ─────────────────────────────────────────
        $this->rrect($img, self::PAD - 12, self::CARD_TOP,
            self::W - self::PAD + 12, self::CARD_BOT, 18, $cBorder);
        $this->rrect($img, self::PAD - 10, self::CARD_TOP + 2,
            self::W - self::PAD + 10, self::CARD_BOT - 2, 16, $cCard);

        // ── شريط علوي أخضر ─────────────────────────────────────────
        imagefilledrectangle($img, 0, 0, self::W, self::Y_TOPBAR, $cGreen);

        // ── خط فاصل أفقي بعد الـ header ───────────────────────────
        imagefilledrectangle($img, self::PAD, self::Y_HSEP,
            self::W - self::PAD, self::Y_HSEP + 1, $cBorder);

        // ── خط فاصل أفقي فوق الـ footer ───────────────────────────
        imagefilledrectangle($img, self::PAD, self::Y_FSEP,
            self::W - self::PAD, self::Y_FSEP + 1, $cBorder);

        // ── المحتوى ───────────────────────────────────────────────
        $fontR = realpath(resource_path('fonts/NotoSansArabic-Regular.ttf')) ?: '';
        $fontB = realpath(resource_path('fonts/NotoSansArabic-Bold.ttf'))    ?: $fontR;
        if (!$fontB) $fontB = $fontR;
        $hasFont = $fontR !== '' && file_exists($fontR);

        if ($hasFont) {
            $this->drawHeader($img, $job, $fontR, $cWhite, $cSilver, $cGold, $cGreen);
            $this->drawCategory($img, $job, $fontR, $cWhite);
            $this->drawTitle($img, $job, $fontB, $cWhite);
            $this->drawMeta($img, $job, $fontR, $cSilver, $cGold);
            $this->drawFooter($img, $fontR, $cSilver, $cGreen);
        } else {
            $this->drawFallback($img, $job, $cWhite, $cGreen, $cGold, $cSilver);
        }

        // ── شارة "حصرية" ───────────────────────────────────────────
        if ($job->is_featured) {
            $bx1 = self::W - self::PAD - 130;
            $bx2 = self::W - self::PAD;
            $this->rrect($img, $bx1, 34, $bx2, 82, 10, $cGold);
            if ($hasFont) {
                $this->centerText($img, 18, $this->rgb($img, self::C_DARK_TXT),
                    $fontR, ($bx1 + $bx2) / 2, 65, '✦ حصرية');
            } else {
                imagestring($img, 4, $bx1 + 14, 52, 'FEATURED', $this->rgb($img, self::C_DARK_TXT));
            }
        }

        // ── تصدير PNG ─────────────────────────────────────────────
        ob_start();
        imagepng($img, null, 7);   // compression 7 — جودة عالية، حجم معقول
        $data = ob_get_clean();
        imagedestroy($img);

        return $data;
    }

    // ════════════════════════════════════════════════════════════════
    // Drawing sections
    // ════════════════════════════════════════════════════════════════

    /** Header: شعار الموقع + اسمه */
    private function drawHeader($img, Job $job, string $font, $cWhite, $cSilver, $cGold, $cGreen): void
    {
        // نقطة خضراء = "شعار" بسيط
        imagefilledellipse($img, self::PAD + 18, 54, 36, 36, $cGreen);
        $this->centerText($img, 16, $cWhite, $font, self::PAD + 18, 61, 'SC');

        // اسم الموقع
        $this->leftText($img, 20, $cWhite, $font, self::PAD + 48, self::Y_LOGO, 'سعودي كارييرز');

        // نوع الدوام (pill صغير)
        if ($job->job_type_label ?? $job->job_type) {
            $typeLabel = $job->job_type_label ?? mb_strtoupper($job->job_type ?? '');
            $this->drawPill($img, $font, 18, $cSilver,
                self::W - self::PAD, self::Y_LOGO, $typeLabel, 'right');
        }
    }

    /** Category pill */
    private function drawCategory($img, Job $job, string $font, $cWhite): void
    {
        $cat  = self::CAT_LABELS[$job->category] ?? ['label' => 'توظيف', 'bg' => [29, 125, 75]];
        $cCat = $this->rgb($img, $cat['bg']);

        // قياس عرض النص لتحديد عرض الـ pill
        $label = $cat['label'];
        $box   = imagettfbbox(18, 0, $font, $label);
        $tw    = abs($box[2] - $box[0]) + 48;   // padding أفقي 24px من كل جانب
        $tw    = max($tw, 160);

        $cx  = self::W / 2;
        $px1 = (int)($cx - $tw / 2);
        $px2 = (int)($cx + $tw / 2);

        $this->rrect($img, $px1, self::Y_CAT_TOP, $px2, self::Y_CAT_BOT, 20, $cCat);
        $this->centerText($img, 18, $cWhite, $font, $cx, self::Y_CAT_TEXT, $label);
    }

    /** عنوان الوظيفة — يُقسَّم لسطرين إذا طال */
    private function drawTitle($img, Job $job, string $font, $cWhite): void
    {
        $title    = $job->title ?? '';
        $maxChars = 28;  // حد الأحرف قبل الكسر (تقريبي للعربية)

        if (mb_strlen($title) <= $maxChars) {
            // سطر واحد — يُمركَز عند Y_TITLE1
            $midY = (int)((self::Y_TITLE1 + self::Y_TITLE2) / 2);
            $this->centerText($img, 52, $cWhite, $font, self::W / 2, $midY, $title);
        } else {
            // كسر عند آخر مسافة قبل الحد
            $line1 = mb_substr($title, 0, $maxChars);
            $break = mb_strrpos($line1, ' ');
            if ($break !== false) {
                $line1 = mb_substr($title, 0, $break);
                $line2 = mb_substr($title, $break + 1);
            } else {
                $line2 = mb_substr($title, $maxChars);
            }
            // اقتصاص السطر الثاني إذا طال جداً
            if (mb_strlen($line2) > $maxChars + 4) {
                $line2 = mb_substr($line2, 0, $maxChars + 2) . '...';
            }
            $this->centerText($img, 48, $cWhite, $font, self::W / 2, self::Y_TITLE1, $line1);
            $this->centerText($img, 48, $cWhite, $font, self::W / 2, self::Y_TITLE2, $line2);
        }
    }

    /** الشركة · المدينة + الراتب */
    private function drawMeta($img, Job $job, string $font, $cSilver, $cGold): void
    {
        // شركة · مدينة
        $company  = $job->company  ?? '';
        $location = $job->location ?? '';
        $meta     = $company . ($location ? '  ·  ' . $location : '');

        $this->centerText($img, 26, $cSilver, $font, self::W / 2, self::Y_META, $meta);

        // الراتب
        if ($job->salary_min) {
            $min = number_format((int)$job->salary_min);
            $max = $job->salary_max ? number_format((int)$job->salary_max) : null;
            $salaryText = $max
                ? "💰  {$min} – {$max}  ر.س / شهرياً"
                : "💰  {$min}+  ر.س / شهرياً";

            $this->centerText($img, 24, $cGold, $font, self::W / 2, self::Y_SALARY, $salaryText);
        }
    }

    /** Footer: رابط الموقع + CTA */
    private function drawFooter($img, string $font, $cSilver, $cGreen): void
    {
        // نقطة خضراء
        imagefilledellipse($img, self::PAD + 10, self::Y_CTA - 8, 14, 14, $cGreen);

        $this->leftText($img, 20, $cSilver, $font,
            self::PAD + 26, self::Y_CTA, 'saudicareers.site');

        $this->rightText($img, 20, $cSilver, $font,
            self::W - self::PAD, self::Y_CTA, 'قدّم الآن ←');
    }

    /** Fallback بدون خط عربي */
    private function drawFallback($img, Job $job, $cWhite, $cGreen, $cGold, $cSilver): void
    {
        $cx = self::W / 2;

        // دائرة category
        $catKey = $job->category ?? 'other';
        $cat    = self::CAT_LABELS[$catKey] ?? ['label' => 'JOB', 'bg' => self::C_GREEN];
        $cCat   = $this->rgb($img, $cat['bg']);
        imagefilledellipse($img, $cx, 195, 120, 120, $cCat);

        $label = strtoupper(preg_replace('/[^\x20-\x7E]/', '', $cat['label']) ?: 'JOB');
        imagestring($img, 5, $cx - strlen($label) * 4, 188, $label, $cWhite);

        // اسم الشركة (بدون عربي)
        $co = preg_replace('/[^\x20-\x7E]/', '', $job->company ?? '') ?: 'Co.';
        $co = substr($co, 0, 32);
        imagestring($img, 5, $cx - strlen($co) * 4, 340, $co, $cWhite);

        // المدينة
        $loc = preg_replace('/[^\x20-\x7E]/', '', $job->location ?? '') ?: 'Saudi Arabia';
        imagestring($img, 4, $cx - strlen($loc) * 4, 376, $loc, $cSilver);

        // الراتب
        if ($job->salary_min) {
            $sal = 'SAR ' . number_format($job->salary_min);
            imagestring($img, 4, $cx - strlen($sal) * 4, 420, $sal, $cGold);
        }

        // URL
        imagestring($img, 3, $cx - 68, self::Y_CTA - 6, 'saudicareers.site', $cSilver);

        // تحذير للمطور (يُزال عند رفع الخط)
        $warn = '! Add NotoSansArabic.ttf to resources/fonts/';
        imagestring($img, 2, $cx - strlen($warn) * 3, self::Y_CTA + 20, $warn, $cGold);
    }

    // ════════════════════════════════════════════════════════════════
    // Text helpers
    // ════════════════════════════════════════════════════════════════

    /** نص مُمركَز أفقياً */
    private function centerText($img, int $size, int $color, string $font, float $cx, int $y, string $text): void
    {
        if (trim($text) === '') return;
        $box = imagettfbbox($size, 0, $font, $text);
        $tw  = abs($box[2] - $box[0]);
        imagettftext($img, $size, 0, (int)($cx - $tw / 2), $y, $color, $font, $text);
    }

    /** نص يبدأ من اليسار */
    private function leftText($img, int $size, int $color, string $font, int $x, int $y, string $text): void
    {
        if (trim($text) === '') return;
        imagettftext($img, $size, 0, $x, $y, $color, $font, $text);
    }

    /** نص ينتهي عند اليمين */
    private function rightText($img, int $size, int $color, string $font, int $xEnd, int $y, string $text): void
    {
        if (trim($text) === '') return;
        $box = imagettfbbox($size, 0, $font, $text);
        $tw  = abs($box[2] - $box[0]);
        imagettftext($img, $size, 0, $xEnd - $tw, $y, $color, $font, $text);
    }

    /** Pill نص صغير مع خلفية دائرية */
    private function drawPill($img, string $font, int $size, int $color, int $xEnd, int $yBaseline, string $text, string $align = 'left'): void
    {
        if (trim($text) === '') return;
        $box = imagettfbbox($size, 0, $font, $text);
        $tw  = abs($box[2] - $box[0]);
        $pad = 16;
        $pw  = $tw + $pad * 2;
        $ph  = $size + $pad;

        $x1 = $align === 'right' ? $xEnd - $pw : $xEnd;
        $y1 = $yBaseline - $size - (int)($pad / 2);
        $x2 = $x1 + $pw;
        $y2 = $y1 + $ph;

        $pillBg = imagecolorallocatealpha($img, 255, 255, 255, 100);
        $this->rrect($img, $x1, $y1, $x2, $y2, 10, $pillBg);
        imagettftext($img, $size, 0, $x1 + $pad, $yBaseline, $color, $font, $text);
    }

    // ════════════════════════════════════════════════════════════════
    // Geometry helpers
    // ════════════════════════════════════════════════════════════════

    /** مستطيل بزوايا مستديرة */
    private function rrect($img, int $x1, int $y1, int $x2, int $y2, int $r, int $color): void
    {
        $r = min($r, (int)(($x2 - $x1) / 2), (int)(($y2 - $y1) / 2));
        imagefilledrectangle($img, $x1 + $r, $y1,       $x2 - $r, $y2,       $color);
        imagefilledrectangle($img, $x1,       $y1 + $r, $x2,       $y2 - $r, $color);
        imagefilledellipse($img, $x1 + $r, $y1 + $r, $r * 2, $r * 2, $color);
        imagefilledellipse($img, $x2 - $r, $y1 + $r, $r * 2, $r * 2, $color);
        imagefilledellipse($img, $x1 + $r, $y2 - $r, $r * 2, $r * 2, $color);
        imagefilledellipse($img, $x2 - $r, $y2 - $r, $r * 2, $r * 2, $color);
    }

    private function rgb($img, array $c): int
    {
        return imagecolorallocate($img, $c[0], $c[1], $c[2]);
    }
}
