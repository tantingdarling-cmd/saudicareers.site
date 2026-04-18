<?php

namespace App\Jobs;

use App\Mail\JobAlertMail;
use App\Models\Job;
use App\Models\JobAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendJobAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 60;

    public function __construct(private readonly Job $job) {}

    public function handle(): void
    {
        JobAlert::where('active', true)
            ->with('user')
            ->each(function (JobAlert $alert) {
                if (!$this->matches($alert)) return;

                Mail::to($alert->user->email)
                    ->queue(new JobAlertMail($this->job, $alert));
            });
    }

    private function matches(JobAlert $alert): bool
    {
        $title    = mb_strtolower($this->job->title ?? '');
        $desc     = mb_strtolower($this->job->description ?? '');
        $location = mb_strtolower($this->job->location ?? '');

        $keywordOk  = !$alert->keyword  || str_contains($title, mb_strtolower($alert->keyword))
                                        || str_contains($desc,  mb_strtolower($alert->keyword));
        $locationOk = !$alert->location || str_contains($location, mb_strtolower($alert->location));

        return $keywordOk && $locationOk;
    }
}
