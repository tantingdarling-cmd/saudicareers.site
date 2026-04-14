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

// §6: Sitemap — public, no auth, outside v1 prefix.
// Accessible at /api/sitemap.xml. For static /sitemap.xml run: php artisan sitemap:generate
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::prefix('v1')->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/featured', [JobController::class, 'index'])->defaults('featured', true);
    Route::get('/jobs/{job}', [JobController::class, 'show']);

    Route::post('/applications', [ApplicationController::class, 'store']);

    Route::get('/tips', [CareerTipController::class, 'index']);
    Route::get('/tips/{tip}', [CareerTipController::class, 'show']);

    Route::post('/subscribe', [SubscriberController::class, 'store']);

    // §2: Resume ATS analyzer — public, throttled (3 req/min per IP)
    Route::post('/resume/analyze', [ResumeController::class, 'analyze'])
        ->middleware('throttle:3,1')
        ->name('resume.analyze');

    // Rate limited to 5 attempts per minute per IP
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login');
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/refresh-token', [AuthController::class, 'refreshToken']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::apiResource('jobs', JobController::class)->except(['index', 'show']);
        Route::post('/jobs/bulk', [BulkJobController::class, 'store']);
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
        Route::get('/subscribers', [SubscriberController::class, 'index']);

        // Only existing admins can create new admin accounts
        Route::post('/register', [AuthController::class, 'register'])->name('register');
    });
});
