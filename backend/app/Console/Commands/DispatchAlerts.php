<?php

namespace App\Console\Commands;

use App\Models\AlertNotification;
use App\Models\Job;
use App\Models\JobAlert;
use Illuminate\Console\Command;

class DispatchAlerts extends Command
{
    protected $signature   = 'dispatch:alerts';
    protected $description = 'Match new jobs (last 24h) against active job_alerts and create notifications';

    public function handle(): int
    {
        $jobs = Job::where('is_active', true)
            ->where('created_at', '>=', now()->subHours(24))
            ->get(['id', 'title', 'company', 'location', 'category']);

        if ($jobs->isEmpty()) {
            $this->info('No new jobs in the last 24h.');
            return 0;
        }

        $alerts    = JobAlert::where('active', true)->get();
        $created   = 0;
        $skipped   = 0;

        foreach ($alerts as $alert) {
            foreach ($jobs as $job) {
                if (!$this->matches($alert, $job)) continue;

                try {
                    AlertNotification::create([
                        'user_id'       => $alert->user_id,
                        'job_id'        => $job->id,
                        'job_alert_id'  => $alert->id,
                        'job_title'     => $job->title,
                        'company'       => $job->company,
                        'location'      => $job->location,
                        'alert_keyword' => $alert->keyword,
                    ]);
                    $created++;
                } catch (\Illuminate\Database\QueryException $e) {
                    // unique constraint: already notified
                    $skipped++;
                }
            }
        }

        $this->info("Done — {$created} notifications created, {$skipped} skipped (duplicates).");
        return 0;
    }

    private function matches(JobAlert $alert, Job $job): bool
    {
        if ($alert->keyword) {
            $kw = mb_strtolower($alert->keyword);
            $haystack = mb_strtolower($job->title . ' ' . $job->company);
            if (!str_contains($haystack, $kw)) return false;
        }

        if ($alert->location) {
            $loc = mb_strtolower($alert->location);
            if (!str_contains(mb_strtolower($job->location ?? ''), $loc)) return false;
        }

        if ($alert->category && $alert->category !== '') {
            if ($job->category !== $alert->category) return false;
        }

        return true;
    }
}
