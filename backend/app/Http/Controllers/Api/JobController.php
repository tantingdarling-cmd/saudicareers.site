<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Http\Resources\JobCollection;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::active()->latest();
        
        if ($request->has('category') && $request->category !== 'all') {
            $query->byCategory($request->category);
        }
        
        if ($request->has('featured')) {
            $query->featured();
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('company', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }
        
        $perPage = $request->input('per_page', 12);
        $jobs = $query->paginate($perPage);
        
        return new JobCollection($jobs);
    }

    public function store(StoreJobRequest $request)
    {
        $job = Job::create($request->validated());
        return response()->json([
            'message' => 'تم إنشاء الوظيفة بنجاح',
            'data' => new JobResource($job)
        ], 201);
    }

    public function show(Job $job)
    {
        return new JobResource($job);
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $job->update($request->validated());
        return response()->json([
            'message' => 'تم تحديث الوظيفة بنجاح',
            'data' => new JobResource($job)
        ]);
    }

    public function destroy(Job $job)
    {
        $job->delete();
        return response()->json([
            'message' => 'تم حذف الوظيفة بنجاح'
        ]);
    }
}
