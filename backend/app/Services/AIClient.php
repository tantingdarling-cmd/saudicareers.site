<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

// NEW
class AIClient
{
    public function generate(string $prompt): string
    {
        return Cache::remember(md5($prompt), 3600, function () use ($prompt) {
            $apiKey = env('ANTHROPIC_API_KEY');
            
            if (!$apiKey) {
                return json_encode([
                    'summary' => 'خطأ: لم يتم ضبط مفتاح الذكاء الاصطناعي.',
                    'experience' => [],
                    'skills' => []
                ]);
            }

            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-5-sonnet-20240620',
                'max_tokens' => 2000,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]);

            if ($response->successful()) {
                $text = $response->json()['content'][0]['text'] ?? '{}';
                
                // Clean markdown if AI returned it
                $text = preg_replace('/^```json\s*|\s*```$/', '', trim($text));
                
                return $text;
            }

            return json_encode([
                'summary' => 'خطأ: فشل الاتصال بمحرك الذكاء الاصطناعي.',
                'experience' => [],
                'skills' => []
            ]);
        });
    }
}
