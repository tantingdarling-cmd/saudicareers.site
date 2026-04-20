<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alert_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_alert_id')->constrained()->cascadeOnDelete();
            $table->string('job_title');
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->string('alert_keyword')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'job_id', 'job_alert_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alert_notifications');
    }
};
