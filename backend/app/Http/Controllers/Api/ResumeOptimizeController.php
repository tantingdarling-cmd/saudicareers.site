<?php

// 📄 app/Http/Controllers/Api/ResumeOptimizeController.php

namespace App\Http\Controllers\Api;

use App\Helpers\PDPLMasker;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResumeRequest;
use App\Jobs\ProcessResume;
use App\Services\ResumeAnalyzer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class ResumeOptimizeController extends Controller
{
    public function __construct(private ResumeAnalyzer $analyzer) {}

    // POST /api/v1/resume/optimize
    public function optimize(ResumeRequest $request): JsonResponse
    {
        DB::table('consent_logs')->insert([
            'service'         => 'resume_ai_optimize',
            'consent_version' => $request->input('consent_version', '1.0'),
            'ip_hash'         => hash('sha256', $request->ip() . config('app.key')),
            'user_agent_hash' => $request->userAgent()
                ? hash('sha256', $request->userAgent()) : null,
            'consented_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $rawText = $request->input('resume_text', '');

        if ($request->hasFile('file')) {
            $disk     = config('ai.pdpl.temp_disk', 'local');
            $path     = config('ai.pdpl.temp_path', 'resumes/tmp');
            $stored   = $request->file('file')->store($path, $disk);
            $fullPath = storage_path("app/{$stored}");

            try {
                $analyzed = $this->analyzer->analyze($fullPath);
                $rawText  = $analyzed['raw_text'] ?? '';
            } finally {
                @unlink($fullPath); // PDPL: لا يُخزَّن الملف على الخادم
            }
        }

        $maskedText = PDPLMasker::mask($rawText);
        $maskedJob  = $request->filled('job_description')
            ? PDPLMasker::mask($request->input('job_description'))
            : null;

        $jobId = (string) Str::uuid();

        ProcessResume::dispatch($jobId, $maskedText, $maskedJob, $request->tier())
            ->onQueue(config('ai.queue.name', 'ai'));

        return response()->json(['job_id' => $jobId], 202);
    }

    // GET /api/v1/resume/status/{jobId}
    public function status(string $jobId): JsonResponse
    {
        if (!Str::isUuid($jobId)) {
            return response()->json(['error' => 'Invalid job ID'], 400);
        }

        $raw = Redis::get("resume_job:{$jobId}");

        if (!$raw) {
            return response()->json(['status' => 'pending', 'percent' => 0], 202);
        }

        return response()->json(json_decode($raw, true));
    }
}
