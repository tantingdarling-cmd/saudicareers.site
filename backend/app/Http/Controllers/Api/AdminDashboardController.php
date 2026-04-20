<?php

namespace App\Http\Controllers\Api;

use App\Models\Job;
use App\Models\JobAlert;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

class AdminDashboardController extends Controller
{
    // GET /api/admin/stats
    public function stats()
    {
        $data = Cache::remember('admin:dashboard:stats', 120, function () {
            return [
                'total_jobs'           => Job::where('is_active', true)->count(),
                'active_alerts'        => JobAlert::where('active', true)->count(),
                'new_users_week'       => User::where('created_at', '>=', now()->subDays(7))->count(),
                'applications_pending' => JobApplication::where('status', 'pending')->count(),
            ];
        });

        return response()->json($data);
    }

    // GET /api/admin/recent-applications
    public function recentApplications()
    {
        $apps = JobApplication::with('job:id,title,company')
            ->latest('applied_at')
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'name'       => $a->name,
                'email'      => $a->email,
                'job_title'  => $a->job?->title,
                'company'    => $a->job?->company,
                'status'     => $a->status,
                'applied_at' => $a->applied_at?->toDateString(),
            ]);

        return response()->json(['data' => $apps]);
    }
}
