<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $settings = [
            // ── Analytics ────────────────────────────────────────────────
            [
                'key'         => 'analytics.ga_id',
                'value'       => null,
                'type'        => 'string',
                'group'       => 'analytics',
                'label'       => 'Google Analytics 4 — Measurement ID',
                'description' => 'معرّف قياس GA4 بصيغة G-XXXXXXXXXX. يُحقن تلقائياً في <head> عبر gtag.js عند تعبئته.',
                'is_public'   => true,
            ],
            [
                'key'         => 'analytics.gtm_id',
                'value'       => null,
                'type'        => 'string',
                'group'       => 'analytics',
                'label'       => 'Google Tag Manager — Container ID',
                'description' => 'معرّف حاوية GTM بصيغة GTM-XXXXXXX. يُحقن كـ script في <head> و noscript في <body>. يُغني عن GA إذا كان GTM يديره.',
                'is_public'   => true,
            ],
            [
                'key'         => 'analytics.fb_pixel',
                'value'       => null,
                'type'        => 'string',
                'group'       => 'analytics',
                'label'       => 'Facebook Pixel — Pixel ID',
                'description' => 'معرّف Facebook Pixel (15-16 رقماً). يُحقن تلقائياً لتتبع التحويلات وجمهور إعادة الاستهداف.',
                'is_public'   => true,
            ],

            // ── General ──────────────────────────────────────────────────
            [
                'key'         => 'site.name',
                'value'       => 'Saudi Careers',
                'type'        => 'string',
                'group'       => 'general',
                'label'       => 'اسم الموقع',
                'description' => 'يظهر في عنوان المتصفح وبطاقات الـ OG.',
                'is_public'   => true,
            ],
            [
                'key'         => 'site.contact_email',
                'value'       => 'hello@saudicareers.site',
                'type'        => 'string',
                'group'       => 'general',
                'label'       => 'بريد التواصل العام',
                'description' => 'يظهر في صفحة الاتصال وسياسة الخصوصية.',
                'is_public'   => true,
            ],
            [
                'key'         => 'site.maintenance_mode',
                'value'       => 'false',
                'type'        => 'boolean',
                'group'       => 'general',
                'label'       => 'وضع الصيانة',
                'description' => 'عند تفعيله، يُعرض للزوار رسالة "قيد الصيانة" ريثما تنتهي.',
                'is_public'   => false,
            ],

            // ── AI Matching Weights (يجب أن يساوي مجموعها 1.0) ──────────
            // البُعد 1: تطابق المهارات والكلمات المفتاحية التقنية
            [
                'key'         => 'ai.weight_skills',
                'value'       => '0.35',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن المهارات التقنية',
                'description' => 'نسبة تطابق الكلمات المفتاحية المهنية والتقنية بين رسالة التقديم ومتطلبات الوظيفة. (مثال: Python، SAP، Excel)',
                'is_public'   => false,
            ],
            // البُعد 2: مستوى الخبرة
            [
                'key'         => 'ai.weight_experience',
                'value'       => '0.25',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن مستوى الخبرة',
                'description' => 'مدى توافق إشارات الخبرة في رسالة التقديم مع المستوى المطلوب (مبتدئ/متوسط/كبير/قيادي).',
                'is_public'   => false,
            ],
            // البُعد 3: المدينة والموقع
            [
                'key'         => 'ai.weight_location',
                'value'       => '0.15',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن الموقع الجغرافي',
                'description' => 'هل ذكر المتقدم المدينة المطلوبة في رسالته؟ أو هل البريد الإلكتروني يشير لها؟',
                'is_public'   => false,
            ],
            // البُعد 4: نوع الوظيفة (دوام كامل/جزئي...)
            [
                'key'         => 'ai.weight_job_type',
                'value'       => '0.10',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن نوع الدوام',
                'description' => 'هل طبيعة العمل المذكورة في الرسالة (عن بعد، دوام كامل...) توافق نوع الوظيفة؟',
                'is_public'   => false,
            ],
            // البُعد 5: التعليم والشهادات
            [
                'key'         => 'ai.weight_education',
                'value'       => '0.07',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن المؤهل التعليمي',
                'description' => 'ذكر كلمات مثل: بكالوريوس، ماجستير، دكتوراه، شهادة، دبلوم في رسالة التقديم.',
                'is_public'   => false,
            ],
            // البُعد 6: تطابق القطاع والتصنيف
            [
                'key'         => 'ai.weight_category',
                'value'       => '0.05',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن القطاع المهني',
                'description' => 'هل ذكر المتقدم مجال الوظيفة (تقنية، مالية، طاقة...) في رسالة التقديم؟',
                'is_public'   => false,
            ],
            // البُعد 7: اكتمال الطلب
            [
                'key'         => 'ai.weight_completeness',
                'value'       => '0.03',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'وزن اكتمال الطلب',
                'description' => 'هل أرفق المتقدم السيرة الذاتية؟ هل أدخل رقم الهاتف؟ هل كتب رسالة تقديم؟',
                'is_public'   => false,
            ],
            // حد الـ High Quality Lead
            [
                'key'         => 'ai.hql_threshold',
                'value'       => '80',
                'type'        => 'number',
                'group'       => 'ai',
                'label'       => 'حد الـ High Quality Lead (%)',
                'description' => 'عند بلوغ درجة المطابقة هذه النسبة أو أعلى، يُطلق حدث GTM "hql_application" لتمييز المتقدمين عالي الجودة.',
                'is_public'   => false,
            ],

            // ── Jobs ─────────────────────────────────────────────────────
            [
                'key'         => 'jobs.cities',
                'value'       => '["الرياض","جدة","مكة المكرمة","المدينة المنورة","الدمام","الخبر","أبها","تبوك","القصيم","حائل"]',
                'type'        => 'json',
                'group'       => 'jobs',
                'label'       => 'قائمة المدن',
                'description' => 'مصفوفة JSON بأسماء المدن. تُستخدم في فلاتر البحث وتوليد الـ slug.',
                'is_public'   => true,
            ],
            [
                'key'         => 'jobs.max_salary_display',
                'value'       => '50000',
                'type'        => 'number',
                'group'       => 'jobs',
                'label'       => 'الحد الأقصى للراتب في الفلاتر',
                'description' => 'أعلى قيمة تظهر في شريط تصفية الراتب (بالريال).',
                'is_public'   => true,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => $now, 'updated_at' => $now])
            );
        }
    }
}
