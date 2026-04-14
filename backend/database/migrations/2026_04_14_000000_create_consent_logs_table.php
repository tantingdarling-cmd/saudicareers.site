<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PDPL Compliance — سجل الموافقات
 *
 * لا يُخزَّن أي PII هنا — فقط:
 *   • hash لـ IP (SHA-256 مع salt) لإثبات الفردية دون تتبع الهوية
 *   • إصدار السياسة التي وافق عليها المستخدم
 *   • توقيت الموافقة
 *
 * لا علاقة بجدول users — قصداً، حفاظاً على الخصوصية.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_logs', function (Blueprint $table) {
            $table->id();
            $table->string('service', 64)->comment('resume_analysis | job_application');
            $table->string('consent_version', 16)->default('1.0')->comment('إصدار سياسة الخصوصية المُوافَق عليها');
            $table->string('ip_hash', 64)->comment('SHA-256(IP + APP_KEY) — غير قابل للعكس');
            $table->string('user_agent_hash', 64)->nullable()->comment('SHA-256(UserAgent)');
            $table->timestamp('consented_at');
            $table->timestamps();

            $table->index(['service', 'consented_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_logs');
    }
};
