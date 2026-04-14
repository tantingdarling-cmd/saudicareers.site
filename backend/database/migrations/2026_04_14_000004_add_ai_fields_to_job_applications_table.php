<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            // درجة المطابقة (0.00–100.00) — تُحسب بـ MatchService عند التقديم
            $table->decimal('match_score', 5, 2)->nullable()->after('notes');

            // موافقة المتقدم على المعالجة بالذكاء الاصطناعي (PDPL — consent_v2)
            $table->boolean('ai_consent')->default(false)->after('match_score');

            // تفاصيل المطابقة — JSON بالأبعاد السبعة (لا يُحفظ فيه أي PII)
            $table->json('match_details')->nullable()->after('ai_consent');
        });

        // إضافة 'withdrawn' لـ enum الحالة
        // MySQL لا تدعم ALTER ENUM مباشرة — نستخدم raw statement
        DB::statement(
            "ALTER TABLE job_applications MODIFY COLUMN status
             ENUM('pending','reviewed','interview','rejected','accepted','withdrawn')
             NOT NULL DEFAULT 'pending'"
        );
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['match_score', 'ai_consent', 'match_details']);
        });

        DB::statement(
            "ALTER TABLE job_applications MODIFY COLUMN status
             ENUM('pending','reviewed','interview','rejected','accepted')
             NOT NULL DEFAULT 'pending'"
        );
    }
};
