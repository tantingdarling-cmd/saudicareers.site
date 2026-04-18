<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;

class SavedJobController extends Controller
{
    public function index(Request $request)
    {
        $jobs = $request->user()
            ->savedJobs()
            ->with('job')
            ->latest()
            ->get()
            ->pluck('job')
            ->filter();

        return response()->json(['data' => $jobs->values()]);
    }

    public function store(Request $request, Job $job)
    {
        $request->user()->savedJobs()->firstOrCreate(['job_id' => $job->id]);
        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, Job $job)
    {
        $request->user()->savedJobs()->where('job_id', $job->id)->delete();
        return response()->json(['saved' => false]);
    }
}
