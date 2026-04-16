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
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function store(StoreApplicationRequest $request, MatchService $matcher)
    {
        $aiConsent = filter_var($request->input('ai_consent', false), FILTER_VALIDATE_BOOLEAN);

        $application = JobApplication::create([
            'job_id'         => $request->job_id,
            'name'           => $request->name,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'cover_letter'   => $request->cover_letter,
            'linkedin_url'   => $request->linkedin_url,
            'portfolio_url'  => $request->portfolio_url,
            'ai_consent'     => $aiConsent,
            'applied_at'     => now(),
            'tracking_token' => Str::random(32),
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
            'message'        => 'تم إرسال طلب التقديم بنجاح',
            'data'           => new ApplicationResource($application),
            'match_score'    => $aiConsent ? ($application->match_score ?? null) : null,
            'tracking_token' => $application->tracking_token,
        ], 201);
    }

    /**
     * endpoint عام — يُعيد بيانات الحالة فقط بدون أي PII
     * GET /api/v1/track/{token}
     */
    public function track(string $token)
    {
        $application = JobApplication::where('tracking_token', $token)
            ->with('job:id,title,company,location,category')
            ->firstOrFail();

        $stages = [
            ['key' => 'pending',   'label' => 'تم استلام الطلب',       'icon' => '📥'],
            ['key' => 'reviewed',  'label' => 'قيد المراجعة',           'icon' => '🔍'],
            ['key' => 'interview', 'label' => 'تم الاختيار للمقابلة',   'icon' => '🤝'],
            ['key' => 'accepted',  'label' => 'تهانينا! تم القبول',     'icon' => '🎉'],
        ];

        $stageOrder = ['pending' => 0, 'reviewed' => 1, 'interview' => 2, 'accepted' => 3, 'rejected' => 2, 'withdrawn' => 0];
        $currentOrder = $stageOrder[$application->status] ?? 0;

        return response()->json([
            'status'       => $application->status,
            'status_label' => $application->status_label,
            'applied_at'   => $application->applied_at?->format('Y-m-d H:i'),
            'match_score'  => $application->ai_consent ? $application->match_score : null,
            'is_rejected'  => $application->status === 'rejected',
            'is_withdrawn' => $application->status === 'withdrawn',
            'current_stage_order' => $currentOrder,
            'stages'       => $stages,
            'job'          => $application->job ? [
                'title'    => $application->job->title,
                'company'  => $application->job->company,
                'location' => $application->job->location,
                'category' => $application->job->category,
            ] : null,
        ]);
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
