<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_en')->nullable();
            $table->string('company');
            $table->string('company_logo')->nullable();
            $table->string('location');
            $table->integer('salary_min')->nullable();
            $table->integer('salary_max')->nullable();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->enum('category', ['tech', 'finance', 'energy', 'construction', 'hr', 'marketing', 'healthcare', 'education', 'other']);
            $table->enum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'remote']);
            $table->enum('experience_level', ['entry', 'mid', 'senior', 'lead', 'executive']);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('apply_url')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
            
            $table->index('category');
            $table->index('is_active');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
