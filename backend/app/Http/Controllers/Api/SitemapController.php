<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\CareerTip;

class SitemapController extends Controller
{
    // §2 / §3: Dynamic sitemap — queries active jobs + published tips.
    // NOTE: On Cloudways, Nginx serves /sitemap.xml as a static file.
    // This endpoint is accessible at /api/sitemap.xml for on-demand generation.
    // For the actual /sitemap.xml served by Nginx, run: php artisan sitemap:generate
    public function index()
    {
        $jobs = Job::where('is_active', true)
            ->select(['id', 'slug', 'title', 'updated_at'])
            ->orderByDesc('updated_at')
            ->get();

        $tips = CareerTip::where('is_published', true)
            ->select(['slug', 'title', 'updated_at'])
            ->orderByDesc('updated_at')
            ->get();

        $xml = view('sitemap', compact('jobs', 'tips'))->render();

        return response($xml, 200)
            ->header('Content-Type', 'text/xml; charset=utf-8')
            ->header('X-Robots-Tag', 'noindex'); // prevent double-indexing — canonical is /sitemap.xml
    }
}
