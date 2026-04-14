<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('probation_records', function (Blueprint $table) {
            $table->id();

            // الموظف — يمكن أن يكون من داخل المنصة (application_id) أو خارجي
            $table->string('employee_name');
            $table->string('employee_email');

            // FK nullable → job_applications (الخيار المختلط داخلي/خارجي)
            $table->foreignId('application_id')
                  ->nullable()
                  ->constrained('job_applications')
                  ->nullOnDelete();

            // ── نظام العمل السعودي — المادة 53 ──────────────────────────────────
            // فترة التجربة لا تتجاوز 90 يوماً، وتُمدَّد مرة واحدة بموافقة خطية
            // حتى 180 يوماً بحد أقصى (ضعف المدة الأصلية)
            $table->date('start_date');
            $table->unsignedSmallInteger('duration_days')->default(90);  // Art.53: default 90

            $table->boolean('extended')->default(false);
            $table->string('extension_docs')->nullable(); // مسار ملف الموافقة

            // حالة التوسيع تُسهّل الفلترة في لوحة التحكم
            $table->enum('status', ['active', 'extended', 'completed', 'terminated'])
                  ->default('active');

            // مسؤولية الإنشاء والتعديل — من هو الـ Admin الذي سجّل القيد؟
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->restrictOnDelete(); // لا يُحذف المستخدم طالما له سجلات

            $table->timestamps();

            // فهارس للاستعلامات الشائعة في لوحة التحكم
            $table->index(['status', 'start_date']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('probation_records');
    }
};
