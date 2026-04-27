<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CareerTipController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BulkJobController;
use App\Http\Controllers\Api\SitemapController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\ResumeOptimizeController;
use App\Http\Controllers\Api\ProbationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SavedJobController;
use App\Http\Controllers\Api\JobAlertController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\EmployerJobController;
use App\Http\Controllers\Api\EmployerApplicationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\SalaryStatsController;
use App\Http\Controllers\Api\ResumeBuilderController;
use App\Http\Controllers\Api\ResumeSnapshotController;
use App\Http\Controllers\Api\NotificationsController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\AdminDashboardController;

// §6: Sitemap — public, no auth, outside v1 prefix.
// Accessible at /api/sitemap.xml. For static /sitemap.xml run: php artisan sitemap:generate
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::post('/register', [AuthController::class, 'publicRegister']);


Route::prefix('v1')->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/featured', [JobController::class, 'index'])->defaults('featured', true);
    Route::get('/jobs/salary-stats', [SalaryStatsController::class, 'index']);
    Route::get('/jobs/{job}/similar', [JobController::class, 'similar']);
    Route::get('/jobs/{job}', [JobController::class, 'show']);

    Route::post('/analytics/events', [AnalyticsController::class, 'store'])->middleware('throttle:60,1');
    Route::get('/analytics/conversions', [AnalyticsController::class, 'conversions']);
    Route::post('/referral/{userId}', [ReferralController::class, 'track'])->middleware('throttle:10,1');
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/track/{token}', [ApplicationController::class, 'track'])
         ->middleware('throttle:30,1')
         ->name('applications.track');

    Route::get('/tips', [CareerTipController::class, 'index']);
    Route::get('/tips/{tip}', [CareerTipController::class, 'show']);

    Route::post('/subscribe', [SubscriberController::class, 'store']);

    Route::get('/companies/{slug}', [CompanyController::class, 'show']);

    // Public settings (GA/GTM/Pixel IDs) — no auth, cached 1h
    Route::get('/settings/public', [SettingsController::class, 'public'])
         ->middleware('throttle:60,1');

    // Resume routes moved to protected group below


    // Rate limited to 5 attempts per minute per IP
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login');

    Route::post('/register', [AuthController::class, 'publicRegister'])
        ->middleware('throttle:5,1')
        ->name('register.public');
});

Route::prefix('v1')->middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/resume/analyze', [ResumeController::class, 'analyze'])
        ->middleware('throttle:3,1')
        ->name('resume.analyze');

    // NEW
    Route::post('/resume/tailor', [ResumeController::class, 'tailor'])
        ->middleware('throttle:3,1')
        ->name('resume.tailor');

    Route::post('/resume/optimize', [ResumeOptimizeController::class, 'optimize'])
        ->middleware('throttle:5,1')
        ->name('resume.optimize');

    Route::get('/resume/status/{jobId}', [ResumeOptimizeController::class, 'status'])
        ->middleware('throttle:60,1')
        ->name('resume.status');

    Route::get('/saved-jobs',               [SavedJobController::class,  'index']);
    Route::post('/saved-jobs/{job}',        [SavedJobController::class,  'store']);
    Route::delete('/saved-jobs/{job}',      [SavedJobController::class,  'destroy']);

    Route::get('/alerts',                   [JobAlertController::class,  'index']);
    Route::post('/alerts',                  [JobAlertController::class,  'store']);
    Route::delete('/alerts/{alert}',        [JobAlertController::class,  'destroy']);
    Route::patch('/alerts/{alert}/toggle',  [JobAlertController::class,  'toggle']);

    Route::get('/profile/resume',            [ProfileController::class,     'show']);
    Route::post('/profile/resume',           [ProfileController::class,     'uploadResume']);

    Route::post('/profile/resume/save',      [ResumeBuilderController::class, 'save']);
    Route::get('/profile/resume/data',       [ResumeBuilderController::class, 'show']);

    Route::get('/profile/resumes',           [ResumeSnapshotController::class, 'index']);
    Route::post('/profile/resumes',          [ResumeSnapshotController::class, 'store']);
    Route::get('/profile/resumes/{id}',      [ResumeSnapshotController::class, 'show']);
    Route::put('/profile/resumes/{id}',      [ResumeSnapshotController::class, 'update']);
    Route::delete('/profile/resumes/{id}',   [ResumeSnapshotController::class, 'destroy']);

    Route::get('/notifications',             [NotificationsController::class, 'index']);
    Route::get('/notifications/unread',      [NotificationsController::class, 'unread']);
    Route::patch('/notifications/read-all',  [NotificationsController::class, 'markAllRead']);
    Route::patch('/notifications/{id}/read', [NotificationsController::class, 'markRead']);

    Route::get('/analytics/week',        [AnalyticsController::class, 'week']);
    Route::get('/referral/my',           [ReferralController::class,  'my']);

    Route::get('/applications/my',                              [ApplicationController::class, 'my']);
    Route::get('/profile/applications/{application}/status',    [ApplicationController::class, 'applicationStatus']);
    Route::patch('/applications/{application}/withdraw',        [ApplicationController::class, 'withdraw']);
    Route::post('/jobs/{job}/apply',                  [ApplicationController::class, 'nativeApply']);

    Route::prefix('employer')->middleware('employer')->group(function () {
        Route::get('/jobs',                                    [EmployerJobController::class,        'index']);
        Route::post('/jobs',                                   [EmployerJobController::class,        'store']);
        Route::put('/jobs/{job}',                              [EmployerJobController::class,        'update']);
        Route::delete('/jobs/{job}',                           [EmployerJobController::class,        'destroy']);
        Route::get('/jobs/{job}/applications',                 [EmployerApplicationController::class,'index']);
        Route::patch('/applications/{application}/status',     [EmployerApplicationController::class,'updateStatus']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats',               [AdminDashboardController::class, 'stats']);
        Route::get('/recent-applications', [AdminDashboardController::class, 'recentApplications']);
        Route::apiResource('jobs', JobController::class)->except(['index', 'show']);
        Route::post('/jobs/bulk', [BulkJobController::class, 'store']);
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
        Route::get('/subscribers', [SubscriberController::class, 'index']);

        // Only existing admins can create new admin accounts
        Route::post('/register', [AuthController::class, 'register'])->name('register');

        // Settings CRUD — admin only
        Route::get('/settings',              [SettingsController::class, 'index']);
        Route::patch('/settings/{key}',      [SettingsController::class, 'update'])
             ->where('key', '.+');           // يسمح بـ dots في الـ key (analytics.ga_id)


        // Probation Tracker — نظام العمل السعودي المادة 53
        // جميع العمليات محمية بـ Sanctum + admin middleware
        Route::get('/probation',              [ProbationController::class, 'index']);
        Route::post('/probation',             [ProbationController::class, 'store']);
        Route::get('/probation/{probation}/status',  [ProbationController::class, 'status']);
        Route::post('/probation/{probation}/extend', [ProbationController::class, 'extend']);
    });
});
