<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // §6: Regenerate sitemap.xml daily at 02:00 server time.
        // Keeps /sitemap.xml fresh without real-time DB queries on every crawl.
        $schedule->command('sitemap:generate')->dailyAt('02:00');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
