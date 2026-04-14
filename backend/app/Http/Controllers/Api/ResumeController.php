<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResumeRequest;
use App\Services\ResumeAnalyzer;

/**
 * §2 / §4: POST /api/v1/resume/analyze
 *
 * Public endpoint (no auth). Rate-limited to 3 req/min per IP (set in routes/api.php).
 * Accepts a PDF ≤ 2MB, runs ATS analysis, deletes the file immediately, returns JSON.
 *
 * Response contract:
 * {
 *   "score":           int (0–100),
 *   "passed":          string[],
 *   "failed":          string[],
 *   "recommendations": string[],
 *   "cta":             "upgrade_for_full_report"
 * }
 */
class ResumeController extends Controller
{
    public function analyze(StoreResumeRequest $request, ResumeAnalyzer $analyzer)
    {
        // Store in local (non-public) disk — never exposed to the web
        $path     = $request->file('file')->store('resumes/tmp', 'local');
        $fullPath = storage_path("app/{$path}");

        try {
            $result = $analyzer->analyze($fullPath);
        } finally {
            // §11: Always clean up — memory + security
            @unlink($fullPath);
        }

        return response()->json($result);
    }
}
