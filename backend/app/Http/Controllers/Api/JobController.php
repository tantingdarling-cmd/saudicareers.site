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
            $request->only(['category', 'location', 'experience_level', 'page'])
        ));

        $jobs = Cache::remember($cacheKey, 3600, fn () => $this->buildQuery($request));

        return new JobCollection($jobs);
    }

    private function buildQuery(Request $request)
    {
        $perPage = $request->input('per_page', 12);
        $query   = Job::active()->latest();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }

        if ($request->has('featured')) {
            $query->featured();
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title',    'LIKE', "%{$search}%")
                  ->orWhere('company', 'LIKE', "%{$search}%")
                  ->orWhere('location','LIKE', "%{$search}%");
            });
        }

        // §9: location + experience_level are valid cache-key params → also filter by them
        if ($request->filled('location')) {
            $query->where('location', 'LIKE', '%' . $request->location . '%');
        }

        if ($request->filled('experience_level')) {
            $query->where('experience_level', $request->experience_level);
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
