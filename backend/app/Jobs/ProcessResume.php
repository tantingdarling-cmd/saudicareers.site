<?php

// 📄 app/Jobs/ProcessResume.php

namespace App\Jobs;

use App\Services\AIGateway;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class ProcessResume implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int   $tries   = 3;
    public int   $timeout = 120;
    public array $backoff = [30, 90, 300];

    private const STATE_TTL = 3600;

    public function __construct(
        private readonly string  $jobId,
        private readonly string  $maskedText,
        private readonly ?string $jobDescription,
        private readonly string  $tier,
    ) {}

    public function handle(AIGateway $gateway): void
    {
        $this->publish('processing', 20);

        try {
            $result = $gateway->optimizeResume(
                $this->maskedText,
                $this->jobDescription,
                $this->tier,
            );

            $this->publish('completed', 100, $result);

        } catch (\RuntimeException $e) {

            if ($this->isQuotaError($e)) {
                $this->fail($e);
                return;
            }

            $this->publish('retrying', 0, [
                'message' => 'جاري إعادة المحاولة...',
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ProcessResume: permanently failed', [
            'job_id' => $this->jobId,
            'tier'   => $this->tier,
            'error'  => $e->getMessage(),
        ]);

        $isQuota = $e instanceof \RuntimeException && $this->isQuotaError($e);

        $this->publish('failed', 0, [
            'message' => $isQuota
                ? 'تم استنفاذ الحصة المتاحة. يرجى المحاولة بعد قليل.'
                : 'فشل التحليل بعد عدة محاولات. يرجى المحاولة لاحقاً.',
        ]);
    }

    // ── Redis State & PubSub ───────────────────────────────────────────────────
    private function publish(string $status, int $percent, array $data = []): void
    {
        $payload = json_encode([
            'job_id'    => $this->jobId,
            'status'    => $status,
            'percent'   => $percent,
            'data'      => $data,
            'timestamp' => now()->toISOString(),
        ]);

        $stateKey = "resume_job:{$this->jobId}";
        $channel  = "resume:{$this->jobId}";

        try {
            Redis::setex($stateKey, self::STATE_TTL, $payload);
            Redis::publish($channel, $payload);
        } catch (\Throwable $e) {
            Log::warning('ProcessResume: Redis publish failed', ['error' => $e->getMessage()]);
        }
    }

    private function isQuotaError(\RuntimeException $e): bool
    {
        $msg = strtolower($e->getMessage());

        return str_contains($msg, '529')
            || str_contains($msg, 'overloaded')
            || str_contains($msg, 'rate_limit')
            || str_contains($msg, '429');
    }
}
