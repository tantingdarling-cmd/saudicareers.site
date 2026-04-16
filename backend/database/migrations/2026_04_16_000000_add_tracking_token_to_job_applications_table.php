<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('tracking_token', 32)->nullable()->unique()->after('applied_at');
        });

        // توليد tokens للطلبات الموجودة مسبقاً
        \App\Models\JobApplication::whereNull('tracking_token')->each(function ($app) {
            $app->updateQuietly(['tracking_token' => Str::random(32)]);
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('tracking_token');
        });
    }
};
