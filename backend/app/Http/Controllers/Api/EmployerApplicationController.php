<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Http\Resources\ApplicationResource;
use Illuminate\Http\Request;

class EmployerApplicationController extends Controller
{
    public function index(Request $request, Job $job)
    {
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $query = JobApplication::where('job_id', $job->id)->latest('applied_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from')) {
            $query->whereDate('applied_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('applied_at', '<=', $request->to);
        }

        $applications = $query->paginate(20);

        return ApplicationResource::collection($applications)->additional([
            'job' => ['id' => $job->id, 'title' => $job->title],
        ]);
    }

    public function updateStatus(Request $request, JobApplication $application)
    {
        $application->load('job');

        if ($application->job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,reviewed,interview,rejected,accepted,withdrawn',
            'notes'  => 'nullable|string|max:1000',
        ]);

        $application->update([
            'status' => $request->status,
            'notes'  => $request->notes,
        ]);

        return response()->json([
            'message' => 'تم تحديث الحالة',
            'data'    => new ApplicationResource($application->fresh()),
        ]);
    }
}
