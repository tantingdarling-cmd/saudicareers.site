<?php

// 📄 app/Services/AIGateway.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class AIGateway
{
    // ── Public API ─────────────────────────────────────────────────────────────

    public function optimizeResume(
        string  $maskedText,
        ?string $jobDescription,
        string  $tier
    ): array {
        $model    = $this->selectModel($maskedText, $jobDescription);
        $prompt   = $this->buildUserPrompt($maskedText, $jobDescription, $tier);

        if (config('ai.dry_run')) {
            return $this->dryRunResponse($model, $maskedText);
        }

        $response = $this->callApi($model, $prompt);
        $this->trackUsage($model, $response['usage'] ?? []);

        return [
            'model'     => $model,
            'tier'      => $tier,
            'result'    => $response['content'][0]['text'] ?? null,
            'usage'     => $response['usage'] ?? [],
            'cache_hit' => ($response['usage']['cache_read_input_tokens'] ?? 0) > 0,
        ];
    }

    // ── Model Routing ──────────────────────────────────────────────────────────
    // Haiku: نص قصير + لا job description + الحصة اليومية تجاوزت الحد
    // Sonnet: نص طويل أو job description موجود (ما لم تُستنفد الحصة)
    private function selectModel(string $text, ?string $jobDesc): string
    {
        $fast  = config('ai.models.fast');
        $smart = config('ai.models.smart');

        if ($this->quotaExceeded()) {
            return $fast;
        }

        $isComplex = strlen($text) > config('ai.routing.haiku_char_limit', 3000)
                  || !empty($jobDesc);

        return $isComplex ? $smart : $fast;
    }

    // ── Quota Check ────────────────────────────────────────────────────────────
    private function quotaExceeded(): bool
    {
        try {
            $key       = config('ai.quota.redis_key');
            $threshold = config('ai.quota.force_haiku_at', 85);
            $usage     = (int) Redis::hget($key, 'usage_percent');

            return $usage >= $threshold;
        } catch (\Throwable) {
            return false; // Redis غير متاح → لا نعاقب المستخدم
        }
    }

    // ── HTTP Call ──────────────────────────────────────────────────────────────
    private function callApi(string $model, string $userPrompt): array
    {
        $modelKey = $model === config('ai.models.smart') ? 'smart' : 'fast';
        $timeout  = config("ai.timeouts.{$modelKey}", 60);

        $response = Http::timeout($timeout)
            ->withHeaders([
                'x-api-key'         => config('ai.api_key'),
                'anthropic-version' => config('ai.api_version'),
                'content-type'      => 'application/json',
            ])
            ->post(config('ai.api_url'), [
                'model'      => $model,
                'max_tokens' => config("ai.max_tokens.{$modelKey}", 1024),
                'system'     => [
                    [
                        'type'          => 'text',
                        'text'          => config('ai.system_prompt'),
                        'cache_control' => ['type' => config('ai.cache.type', 'ephemeral')],
                    ],
                ],
                'messages' => [
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if ($response->failed()) {
            Log::error('AIGateway: API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'model'  => $model,
            ]);

            throw new \RuntimeException(
                "Anthropic API error ({$response->status()}): "
                . ($response->json('error.message') ?? $response->body())
            );
        }

        return $response->json();
    }

    // ── Prompt Builder ─────────────────────────────────────────────────────────
    private function buildUserPrompt(string $resumeText, ?string $jobDesc, string $tier): string
    {
        $parts = ["## Resume Text:\n{$resumeText}"];

        if (!empty($jobDesc)) {
            $parts[] = "## Target Job Description:\n{$jobDesc}";
        }

        $schema = $tier === 'pro'
            ? '{"optimized_summary":"","key_achievements":[],"ats_keywords":[],'
              . '"missing_skills":{"hard":[],"soft":[]},"skill_gap_priority":[],"optimization_score":0}'
            : '{"optimized_summary":"","key_achievements":[],"ats_keywords":[],"optimization_score":0}';

        $parts[] = "## Task:\nReturn ONLY a valid JSON object matching this schema:\n{$schema}";

        return implode("\n\n", $parts);
    }

    // ── Dry Run ────────────────────────────────────────────────────────────────
    private function dryRunResponse(string $model, string $text): array
    {
        $estTokens = (int) (strlen($text) / 4);

        Log::info("🧪 DRY RUN: Model={$model}, Est_Tokens={$estTokens}");

        return [
            'model'     => $model,
            'tier'      => 'simulated',
            'result'    => json_encode(['status' => 'simulated']),
            'usage'     => [],
            'cache_hit' => false,
        ];
    }

    // ── Redis Token Tracking ───────────────────────────────────────────────────
    private function trackUsage(string $model, array $usage): void
    {
        if (empty($usage)) {
            return;
        }

        try {
            $date     = now()->format('Y-m-d');
            $modelKey = "ai_usage:{$model}:{$date}";
            $totalKey = config('ai.quota.redis_key') . ":{$date}";
            $ttl      = config('ai.quota.redis_ttl', 86400);

            $fields = [
                'input'       => $usage['input_tokens'] ?? 0,
                'output'      => $usage['output_tokens'] ?? 0,
                'cache_write' => $usage['cache_creation_input_tokens'] ?? 0,
                'cache_read'  => $usage['cache_read_input_tokens'] ?? 0,
            ];

            Redis::pipeline(function ($pipe) use ($modelKey, $totalKey, $fields, $ttl) {
                foreach ($fields as $field => $count) {
                    if ($count > 0) {
                        $pipe->hincrby($modelKey, $field, $count);
                        $pipe->hincrby($totalKey,  $field, $count);
                    }
                }
                $pipe->expire($modelKey, $ttl);
                $pipe->expire($totalKey,  $ttl);
            });
        } catch (\Throwable $e) {
            Log::warning('AIGateway: Redis tracking failed', ['error' => $e->getMessage()]);
        }
    }
}
