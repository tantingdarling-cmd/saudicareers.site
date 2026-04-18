<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class EmployerJobController extends Controller
{
    public function index(Request $request)
    {
        $jobs = Job::where('user_id', $request->user()->id)
            ->withCount('applications')
            ->latest()
            ->get(['id', 'title', 'location', 'post_status', 'is_active', 'posted_at', 'created_at']);

        return response()->json(['data' => $jobs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'company'          => 'required|string|max:255',
            'location'         => 'required|string|max:255',
            'description'      => 'required|string',
            'requirements'     => 'nullable|string',
            'category'         => 'required|string|max:100',
            'job_type'         => 'required|in:full_time,part_time,contract,freelance,internship',
            'experience_level' => 'required|in:entry,mid,senior,lead,executive',
            'salary_min'       => 'nullable|integer|min:0',
            'salary_max'       => 'nullable|integer|min:0',
            'apply_url'        => 'nullable|url',
            'post_status'      => 'nullable|in:draft,active,expired',
        ]);

        $job = Job::create(array_merge($validated, [
            'user_id'     => $request->user()->id,
            'post_status' => $validated['post_status'] ?? 'active',
            'is_active'   => ($validated['post_status'] ?? 'active') === 'active',
            'posted_at'   => now(),
        ]));

        Cache::flush();

        return response()->json(['message' => 'تم نشر الوظيفة بنجاح', 'data' => $job], 201);
    }

    public function update(Request $request, Job $job)
    {
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'post_status' => 'sometimes|in:draft,active,expired',
            'is_active'   => 'sometimes|boolean',
        ]);

        $job->update($validated);
        Cache::flush();

        return response()->json(['message' => 'تم التحديث', 'data' => $job->fresh()]);
    }

    public function destroy(Request $request, Job $job)
    {
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $job->delete();
        Cache::flush();

        return response()->json(['deleted' => true]);
    }
}
