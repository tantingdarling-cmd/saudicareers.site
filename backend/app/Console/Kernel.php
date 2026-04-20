<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // §6: Regenerate sitemap.xml daily at 02:00 server time.
        $schedule->command('sitemap:generate')->dailyAt('02:00');

        // Match new jobs against job_alerts → create in-app notifications
        $schedule->command('dispatch:alerts')->hourly();
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
