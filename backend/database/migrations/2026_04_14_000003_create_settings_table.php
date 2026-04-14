<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();           // مفتاح فريد (مثل: analytics.ga_id)
            $table->text('value')->nullable();           // القيمة — نص أو JSON
            $table->enum('type', ['string','number','boolean','json','textarea'])
                  ->default('string');
            $table->string('group', 64)->default('general'); // لتجميع الإعدادات في UI
            $table->string('label', 160);               // اسم الحقل بالعربية
            $table->text('description')->nullable();     // وصف يساعد الأدمن على فهم الاستخدام
            $table->boolean('is_public')->default(false); // هل يُعاد في public API؟
            $table->timestamps();

            $table->index('group');
            $table->index('is_public');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
