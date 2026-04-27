<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResumeRequest;
use App\Services\ResumeAnalyzer;
use App\Services\AIClient;               // UPDATED
use App\Services\SkillExtractorService;
use App\Services\SkillMatcherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Smalot\PdfParser\Parser;

/**
 * §2 / §4: POST /api/v1/resume/analyze
 *
 * Public endpoint (no auth). Rate-limited to 3 req/min per IP (set in routes/api.php).
 * Accepts a PDF ≤ 2MB, runs ATS analysis, deletes the file immediately, returns JSON.
 * PDPL: logs consent_at + ip_hash + consent_version before processing.
 */
class ResumeController extends Controller
{
    // NEW
    public function tailor(Request $request)
    {
        $request->validate([
            'file'            => 'required|file|mimes:pdf|max:2048',
            'job_description' => 'required|string|max:5000',
        ]);

        $path     = $request->file('file')->store('resumes/tmp', 'local');
        $fullPath = storage_path("app/{$path}");

        try {
            $parser = new Parser();
            $pdf    = $parser->parseFile($fullPath);
            $text   = $pdf->getText();
        } finally {
            @unlink($fullPath);
        }

        // UPDATED
        $extractor    = new SkillExtractorService();
        $matcher      = new SkillMatcherService();

        $resumeSkills = $extractor->extract($text);
        $jobSkills    = $extractor->extract($request->input('job_description'));
        $result       = $matcher->match($resumeSkills['skills'], $jobSkills['skills']);

        // UPDATED
        $missing = implode(', ', $result['missing']);
        $prompt  = "Resume:\n{$text}\n\nJob Description:\n{$request->input('job_description')}\n\nMissing Skills: {$missing}\n\nRewrite the resume to better match the job. Keep it professional and ATS-friendly.\nReturn ONLY valid JSON in this format:\n{\"summary\":\"\",\"experience\":[{\"title\":\"\",\"bullets\":[]}],\"skills\":[]}";

        $ai         = new AIClient();
        $optimized  = $ai->generate($prompt);
        $structured = json_decode($optimized, true);

        return response()->json([
            'resume_skills'    => $resumeSkills['skills'],
            'job_skills'       => $jobSkills['skills'],
            'matched'          => $result['matched'],
            'missing'          => $result['missing'],
            'score'            => $result['score'],
            'optimized_resume' => $structured, // UPDATED
        ]);
    }

    public function analyze(StoreResumeRequest $request, ResumeAnalyzer $analyzer)
    {
        // ── PDPL: تسجيل الموافقة قبل أي معالجة ───────────────────
        // ip_hash = SHA-256(IP + APP_KEY) — لا يمكن عكسه لمعرفة IP الأصلي
        DB::table('consent_logs')->insert([
            'service'          => 'resume_analysis',
            'consent_version'  => $request->input('consent_version', '1.0'),
            'ip_hash'          => hash('sha256', $request->ip() . config('app.key')),
            'user_agent_hash'  => $request->userAgent()
                                    ? hash('sha256', $request->userAgent())
                                    : null,
            'consented_at'     => now(),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // ── تحليل السيرة (الملف يُحذف فور الانتهاء) ─────────────
        $path     = $request->file('file')->store('resumes/tmp', 'local');
        $fullPath = storage_path("app/{$path}");

        try {
            $result = $analyzer->analyze($fullPath);
        } finally {
            @unlink($fullPath); // §11: PDPL — لا يبقى الملف على الخادم
        }

        return response()->json($result);
    }
}
