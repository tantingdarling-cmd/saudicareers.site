<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request)
    {
        $application = JobApplication::create([
            'job_id' => $request->job_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'cover_letter' => $request->cover_letter,
            'linkedin_url' => $request->linkedin_url,
            'portfolio_url' => $request->portfolio_url,
            'applied_at' => now(),
        ]);
        
        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('cvs', 'public');
            $application->update(['cv_path' => $path]);
        }
        
        return response()->json([
            'message' => 'تم إرسال طلب التقديم بنجاح',
            'data' => new ApplicationResource($application)
        ], 201);
    }
    
    public function index(Request $request)
    {
        $query = JobApplication::with('job');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('job_id')) {
            $query->where('job_id', $request->job_id);
        }
        
        $applications = $query->latest()->paginate(20);
        
        return ApplicationResource::collection($applications);
    }
    
    public function updateStatus(Request $request, JobApplication $application)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,interview,rejected,accepted',
            'notes' => 'nullable|string'
        ]);
        
        $application->update([
            'status' => $request->status,
            'notes' => $request->notes
        ]);
        
        return response()->json([
            'message' => 'تم تحديث حالة الطلب',
            'data' => new ApplicationResource($application)
        ]);
    }
}
