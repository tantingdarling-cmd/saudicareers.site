<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\CareerTipController;
use App\Http\Controllers\Api\SubscriberController;

Route::prefix('v1')->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/featured', [JobController::class, 'index'])->defaults('featured', true);
    Route::get('/jobs/{job}', [JobController::class, 'show']);
    
    Route::post('/applications', [ApplicationController::class, 'store']);
    
    Route::get('/tips', [CareerTipController::class, 'index']);
    Route::get('/tips/{tip}', [CareerTipController::class, 'show']);
    
    Route::post('/subscribe', [SubscriberController::class, 'store']);
});

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('jobs', JobController::class)->except(['index', 'show']);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);
    Route::get('/subscribers', [SubscriberController::class, 'index']);
});
