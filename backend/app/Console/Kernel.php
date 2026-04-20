<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // §6: Regenerate sitemap.xml daily at 02:00 server time.
        $schedule->command('sitemap:generate')->hourly();

        // Match new jobs against job_alerts → create in-app notifications
        $schedule->command('dispatch:alerts')->hourly();

        // Weekly job digest email every Friday at 18:00
        $schedule->command('send:weekly-digest')->fridays()->at('18:00');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }
}
