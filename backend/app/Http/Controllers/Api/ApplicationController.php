<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Setting;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Notifications\AdminHQLAlertNotification;
use App\Notifications\HighMatchApplicationNotification;
use App\Services\MatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request, MatchService $matcher)
    {
        $aiConsent = filter_var($request->input('ai_consent', false), FILTER_VALIDATE_BOOLEAN);

        $application = JobApplication::create([
            'job_id'        => $request->job_id,
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
            'cover_letter'  => $request->cover_letter,
            'linkedin_url'  => $request->linkedin_url,
            'portfolio_url' => $request->portfolio_url,
            'ai_consent'    => $aiConsent,
            'applied_at'    => now(),
        ]);

        $cvPath = null;
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('cvs', 'public');
            $application->update(['cv_path' => $cvPath]);
        }

        // ── AI Matching — يعمل فقط بموافقة صريحة (PDPL consent_v2) ──
        if ($aiConsent) {
            $job    = Job::find($request->job_id);
            $result = $matcher->score($job, [
                'cover_letter'  => $request->cover_letter,
                'phone'         => $request->phone,
                'cv_path'       => $cvPath,
                'linkedin_url'  => $request->linkedin_url,
                'portfolio_url' => $request->portfolio_url,
            ]);

            // PDPL: match_details لا يحتوي أي PII — فقط الأبعاد والأوزان
            $application->update([
                'match_score'   => $result['score'],
                'match_details' => $result['details'],
            ]);

            // ── إشعارات HQL — تُطلق فقط عند تجاوز العتبة ──
            $hqlThreshold = (float) Setting::get('ai.hql_threshold', 80);
            if ($result['score'] >= $hqlThreshold) {
                // 1. إشعار المتقدم (بريده الشخصي)
                $application->notify(
                    new HighMatchApplicationNotification($application, $job, $result['score'])
                );

                // 2. تنبيه الأدمن (contact_email من الإعدادات)
                $adminEmail = Setting::get('site.contact_email');
                if ($adminEmail) {
                    Notification::route('mail', $adminEmail)
                        ->notify(new AdminHQLAlertNotification(
                            $application,
                            $job,
                            $result['score'],
                            $result['details'] ?? [],
                        ));
                }
            }
        }

        return response()->json([
            'message'     => 'تم إرسال طلب التقديم بنجاح',
            'data'        => new ApplicationResource($application),
            'match_score' => $aiConsent ? ($application->match_score ?? null) : null,
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
            'status' => 'required|in:pending,reviewed,interview,rejected,accepted,withdrawn',
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
