<?php

namespace App\Jobs;

use App\Services\RadarService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class InvalidateSimilarCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private string $vectorId) {}

    public function handle(RadarService $radar): void
    {
        $radar->forgetSimilar($this->vectorId);
    }
}
