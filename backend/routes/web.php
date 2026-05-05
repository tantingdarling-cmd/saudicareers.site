<?php

use Illuminate\Support\Facades\Route;
use App\Models\Job;
use App\Models\CareerTip;
use App\Http\Controllers\Web\JobPageController;
use App\Http\Controllers\Web\OgImageController;

/*
|--------------------------------------------------------------------------
| Web Routes — served without /api prefix
|--------------------------------------------------------------------------
| sitemap.xml  — dynamic XML including all jobs and tips
| robots.txt   — served by Laravel (fallback if static file isn't found)
|--------------------------------------------------------------------------
*/

// ═══════════════════════════════════════════════════════════════════
// Hybrid SEO Routes — صفحات الوظائف مخدومة من Laravel لضمان الـ SEO
//
// الآلية:
//   nginx يوجّه /jobs/* و /og/* إلى Laravel (index.php)
//   Laravel يقرأ React's index.html، يحقن meta الوظيفة، يُعيد HTML كامل
//   React تتولى التفاعل بعد التحميل (hydration)
//
// يتطلب في nginx.conf إضافة:
//   location ~ ^/(jobs|og)(/.*)?$ { try_files $uri @laravel; }
// ═══════════════════════════════════════════════════════════════════

Route::get('/jobs/{idOrSlug}', [JobPageController::class, 'show'])
    ->middleware('throttle:120,1')
    ->name('jobs.show');

Route::get('/og/jobs/{id}', [OgImageController::class, 'job'])
    ->middleware('throttle:60,1')
    ->where('id', '[0-9]+')
    ->name('og.jobs');

Route::get('/sitemap.xml', function () {
    $baseUrl = 'https://saudicareers.site';
    $today   = now()->toDateString();

    // Static pages
    $urls = [
        ['loc' => $baseUrl . '/',        'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '1.0'],
        ['loc' => $baseUrl . '/#jobs',   'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '0.9'],
        ['loc' => $baseUrl . '/#tips',   'lastmod' => $today, 'changefreq' => 'weekly',  'priority' => '0.7'],
    ];

    // Active jobs
    try {
        Job::active()
            ->orderByDesc('updated_at')
            ->select('id', 'title', 'updated_at', 'posted_at')
            ->each(function ($job) use (&$urls, $baseUrl) {
                $lastmod = ($job->updated_at ?? $job->posted_at ?? now())->toDateString();
                $urls[]  = [
                    'loc'        => $baseUrl . '/jobs/' . $job->id,
                    'lastmod'    => $lastmod,
                    'changefreq' => 'weekly',
                    'priority'   => '0.85',
                ];
            });
    } catch (\Throwable $e) {
        // DB unavailable — skip job URLs gracefully
    }

    // Published tips
    try {
        CareerTip::published()
            ->orderByDesc('updated_at')
            ->select('slug', 'updated_at', 'published_at')
            ->each(function ($tip) use (&$urls, $baseUrl) {
                $lastmod = ($tip->updated_at ?? $tip->published_at ?? now())->toDateString();
                $urls[]  = [
                    'loc'        => $baseUrl . '/tips/' . $tip->slug,
                    'lastmod'    => $lastmod,
                    'changefreq' => 'monthly',
                    'priority'   => '0.75',
                ];
            });
    } catch (\Throwable $e) {
        // DB unavailable — skip tip URLs gracefully
    }

    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

    foreach ($urls as $url) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . e($url['loc']) . "</loc>\n";
        $xml .= "    <lastmod>" . $url['lastmod'] . "</lastmod>\n";
        $xml .= "    <changefreq>" . $url['changefreq'] . "</changefreq>\n";
        $xml .= "    <priority>" . $url['priority'] . "</priority>\n";
        $xml .= "  </url>\n";
    }

    $xml .= '</urlset>';

    return response($xml, 200)
        ->header('Content-Type', 'application/xml; charset=UTF-8')
        ->header('X-Robots-Tag', 'noindex')
        ->header('Cache-Control', 'public, max-age=3600');
});

Route::get('/robots.txt', function () {
    $content = "User-agent: *\n"
             . "Allow: /\n"
             . "\n"
             . "# Block admin panel from indexing\n"
             . "Disallow: /admin\n"
             . "Disallow: /api/\n"
             . "\n"
             . "Sitemap: https://saudicareers.site/sitemap.xml\n";

    return response($content, 200)
        ->header('Content-Type', 'text/plain; charset=UTF-8')
        ->header('Cache-Control', 'public, max-age=86400');
});

// SPA Fallback — any route not handled above will serve the React index.html
Route::fallback(function () {
    return file_get_contents(public_path('index.html'));
});
