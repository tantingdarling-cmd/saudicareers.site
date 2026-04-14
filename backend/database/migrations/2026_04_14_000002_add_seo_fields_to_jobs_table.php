<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // slug — فريد، nullable مؤقتاً لتجنب تعارض الصفوف الموجودة
            $table->string('slug')->nullable()->unique()->after('title_en');

            // salary_currency — افتراضي SAR (Google Jobs يحتاجه للـ JobPosting schema)
            $table->string('salary_currency', 3)->default('SAR')->after('salary_max');

            // Meta fields — قابلة للتخصيص يدوياً، وإلا تُولَّد تلقائياً في الـ Model
            $table->string('meta_title', 160)->nullable()->after('salary_currency');
            $table->string('meta_description', 320)->nullable()->after('meta_title');

            $table->index('slug');
        });

        // أنشئ slugs للوظائف الموجودة بناءً على العنوان الإنجليزي أو العربي
        DB::table('jobs')->orderBy('id')->each(function ($job) {
            $base = $job->title_en
                ? Str::slug($job->title_en)
                : 'job-' . $job->id;

            $slug = $base;
            $i    = 1;
            while (DB::table('jobs')->where('slug', $slug)->where('id', '!=', $job->id)->exists()) {
                $slug = $base . '-' . $i++;
            }

            DB::table('jobs')->where('id', $job->id)->update(['slug' => $slug]);
        });

        // الآن يمكن جعل الحقل غير nullable
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropColumn(['slug', 'salary_currency', 'meta_title', 'meta_description']);
        });
    }
};
