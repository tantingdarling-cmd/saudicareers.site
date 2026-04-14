<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CareerTipController;
use App\Http\Controllers\Api\SubscriberController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BulkJobController;

Route::prefix('v1')->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/featured', [JobController::class, 'index'])->defaults('featured', true);
    Route::get('/jobs/{job}', [JobController::class, 'show']);

    Route::post('/applications', [ApplicationController::class, 'store']);

    Route::get('/tips', [CareerTipController::class, 'index']);
    Route::get('/tips/{tip}', [CareerTipController::class, 'show']);

    Route::post('/subscribe', [SubscriberController::class, 'store']);

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
