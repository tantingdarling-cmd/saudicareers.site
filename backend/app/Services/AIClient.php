<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

// NEW
class AIClient
{
    public function generate(string $prompt): string
    {
        return Cache::remember(md5($prompt), 3600, function () {
            return "AI response placeholder";
        });
    }
}
