<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Web\OgImageController;
use App\Models\Job;
use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Http\Resources\JobCollection;
use App\Services\SeoService;
use Illuminate\Http\Request;
use App\Jobs\SendJobAlert;
use Illuminate\Support\Facades\Cache;

class JobController extends Controller
{
    // ── §2 / §4: GET /api/v1/jobs ────────────────────────────────────
    // Cache key covers the 4 filterable params that affect pagination.
    // Admins bypass cache so they always see the freshest data.
    // TTL: 3600s (1 hour). Invalidated on every write (store/update/destroy).
    public function index(Request $request)
    {
        if ($request->user()?->isAdmin()) {
            return new JobCollection($this->buildQuery($request));
        }

        $cacheKey = 'jobs:' . md5(json_encode(
            $request->only(['category', 'location', 'experience_level', 'job_type', 'salary_min', 'salary_max', 'q', 'search', 'is_featured', 'featured', 'featured_partners', 'gov_partner', 'page'])
        ));

        $ttl  = $request->filled('q') || $request->filled('search') ? 300 : 3600;
        $jobs = Cache::remember($cacheKey, $ttl, fn () => $this->buildQuery($request));

        return new JobCollection($jobs);
    }

    private function buildQuery(Request $request)
    {
        $perPage = $request->input('per_page', 12);
        $query   = Job::active()->with('company')->latest();

        if ($request->boolean('featured_partners') || $request->boolean('gov_partner')) {
            $query->orderByRaw('is_government_partner DESC')->where('is_government_partner', true);
            $perPage = 6;
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        if ($request->has('featured') || $request->boolean('is_featured')) {
            $query->featured();
        }

        $search = $request->filled('q') ? $request->q : $request->search;
        if ($search) {
            $variants = $this->arabicVariants($search);
            $query->where(function ($q) use ($variants) {
                foreach ($variants as $v) {
                    $q->orWhere('title',       'LIKE', "%{$v}%")
                      ->orWhere('company',     'LIKE', "%{$v}%")
                      ->orWhere('location',    'LIKE', "%{$v}%")
                      ->orWhere('description', 'LIKE', "%{$v}%");
                }
            });
        }

        if ($request->filled('location')) {
            $query->where('location', 'LIKE', '%' . $request->location . '%');
        }

        if ($request->filled('experience_level')) {
            $query->where('experience_level', $request->experience_level);
        }

        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('salary_min')) {
            $query->where('salary_max', '>=', (int) $request->salary_min);
        }

        if ($request->filled('salary_max')) {
            $query->where('salary_min', '<=', (int) $request->salary_max);
        }

        return $query->paginate($perPage);
    }

    public function store(StoreJobRequest $request)
    {
        $job = Job::create($request->validated());
        Cache::flush();
        SendJobAlert::dispatch($job)->onQueue('notifications');
        return response()->json([
            'message' => 'تم إنشاء الوظيفة بنجاح',
            'data'    => new JobResource($job),
        ], 201);
    }

    // ── §4 / §10: GET /api/v1/jobs/{id} ─────────────────────────────
    // Appends similar_jobs[] + seo block (meta + JSON-LD) for the React head manager.
    // inRandomOrder() keeps the section feeling fresh on every visit.
    public function show(Job $job, SeoService $seo)
    {
        $job->loadMissing('company');

        $similar = Job::where('id', '!=', $job->id)
            ->where('category', $job->category)
            ->active()
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return (new JobResource($job))->additional([
            'similar_jobs' => JobResource::collection($similar),
            'seo'          => [
                'title'       => $seo->metaTitle($job),
                'description' => $seo->metaDescription($job),
                'json_ld'     => $seo->jobPosting($job),
            ],
        ]);
    }

    // Returns the original term + 3 Arabic typo variants (ة↔ه, أ↔ا, ي↔ى)
    private function arabicVariants(string $term): array
    {
        $variants = [$term];
        $maps = [['ة','ه'], ['ه','ة'], ['أ','ا'], ['ا','أ'], ['ي','ى'], ['ى','ي']];
        foreach ($maps as [$from, $to]) {
            $v = str_replace($from, $to, $term);
            if ($v !== $term && !in_array($v, $variants)) {
                $variants[] = $v;
            }
        }
        return array_unique($variants);
    }

    // GET /api/v1/jobs/{id}/similar — same category & location, limit 4, 1h cache
    public function similar(Job $job)
    {
        $cacheKey = 'similar:' . $job->id;

        $similar = Cache::remember($cacheKey, 3600, function () use ($job) {
            $query = Job::where('id', '!=', $job->id)
                ->where('category', $job->category)
                ->active();

            if ($job->location) {
                $query->where('location', 'LIKE', '%' . $job->location . '%');
            }

            $result = $query->inRandomOrder()->limit(4)->get();

            // fallback: drop location filter if no results
            if ($result->isEmpty()) {
                $result = Job::where('id', '!=', $job->id)
                    ->where('category', $job->category)
                    ->active()
                    ->inRandomOrder()
                    ->limit(4)
                    ->get();
            }

            return $result;
        });

        return response()->json(['data' => JobResource::collection($similar)]);
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $job->update($request->validated());
        Cache::flush();                         // invalidate jobs cache on write
        OgImageController::clearCache($job->id); // invalidate OG image cache
        return response()->json([
            'message' => 'تم تحديث الوظيفة بنجاح',
            'data'    => new JobResource($job),
        ]);
    }

    public function destroy(Job $job)
    {
        $jobId = $job->id;
        $job->delete();
        Cache::flush();
        OgImageController::clearCache($jobId);
        return response()->json([
            'message' => 'تم حذف الوظيفة بنجاح',
        ]);
    }
}
