<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Models\CareerTip;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\View;

class GenerateSitemap extends Command
{
    protected $signature   = 'sitemap:generate';
    protected $description = 'Generate public/sitemap.xml and ping Google Search Console';

    public function handle(): int
    {
        $jobs = Job::where('is_active', true)
            ->select(['id', 'title', 'updated_at'])
            ->orderByDesc('updated_at')
            ->get();

        $tips = CareerTip::where('is_published', true)
            ->select(['slug', 'title', 'updated_at'])
            ->orderByDesc('updated_at')
            ->get();

        $xml  = View::make('sitemap', compact('jobs', 'tips'))->render();
        $dest = public_path('sitemap.xml');

        file_put_contents($dest, $xml);

        $this->info("Sitemap written → {$dest}");
        $this->info("  Jobs: {$jobs->count()} | Tips: {$tips->count()}");

        // Ping Google to re-crawl (fire-and-forget, ignore failures)
        $ping = 'https://www.google.com/ping?sitemap=' . urlencode('https://saudicareers.site/sitemap.xml');
        $ch   = curl_init($ping);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $code === 200
            ? $this->info('  Google pinged ✓')
            : $this->warn("  Google ping returned HTTP {$code}");

        return self::SUCCESS;
    }
}
