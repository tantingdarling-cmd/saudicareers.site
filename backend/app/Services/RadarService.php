<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RadarService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.radar.url', ''), '/');
    }

    public function getSimilarJobs(string $vectorId): array
    {
        return Cache::store('file')->remember("similar:{$vectorId}", now()->addHours(6), function () use ($vectorId) {
            $response = Http::timeout(5)->get("{$this->baseUrl}/similar/{$vectorId}");

            if ($response->failed()) {
                Log::warning('RadarService: similar request failed', [
                    'vector_id' => $vectorId,
                    'status'    => $response->status(),
                ]);
                return [];
            }

            return $response->json('data', []);
        });
    }

    public function forgetSimilar(string $vectorId): void
    {
        Cache::store('file')->forget("similar:{$vectorId}");
    }
}
