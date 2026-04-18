<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;

class GacaPartnerSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            [
                'title'                 => 'محلل بيانات الطيران',
                'title_en'              => 'Aviation Data Analyst',
                'company'               => 'الهيئة العامة للطيران المدني',
                'location'              => 'الرياض',
                'category'              => 'tech',
                'job_type'              => 'full_time',
                'experience_level'      => 'mid',
                'salary_min'            => 12000,
                'salary_max'            => 18000,
                'salary_currency'       => 'SAR',
                'description'           => 'تبحث الهيئة العامة للطيران المدني عن محلل بيانات متخصص لدعم قرارات تطوير قطاع الطيران في إطار رؤية 2030 وخطة التحول الرقمي للقطاع.',
                'requirements'          => 'بكالوريوس تقنية معلومات أو إحصاء. خبرة سنتان+ في تحليل البيانات. إلمام بـ Python وSQL. يُفضّل خبرة في قطاع الطيران أو الخدمات اللوجستية.',
                'apply_url'             => 'https://www.gaca.gov.sa/arabic/Pages/Careers.aspx',
                'is_active'             => true,
                'is_featured'           => false,
                'is_government_partner' => true,
                'is_urgent'             => true,
                'posted_at'             => now()->subDays(2),
            ],
            [
                'title'                 => 'مهندس تقنية معلومات',
                'title_en'              => 'IT Infrastructure Engineer',
                'company'               => 'الهيئة العامة للطيران المدني',
                'location'              => 'جدة',
                'category'              => 'tech',
                'job_type'              => 'full_time',
                'experience_level'      => 'senior',
                'salary_min'            => 15000,
                'salary_max'            => 22000,
                'salary_currency'       => 'SAR',
                'description'           => 'إدارة وتطوير البنية التحتية لتقنية المعلومات في مطارات المملكة. تنسيق مع الجهات الدولية لتطبيق معايير الأمن الرقمي.',
                'requirements'          => 'بكالوريوس هندسة حاسب. خبرة 5+ سنوات في إدارة الشبكات. شهادات Cisco/Microsoft معتمدة. اللغة الإنجليزية بطلاقة.',
                'apply_url'             => 'https://www.gaca.gov.sa/arabic/Pages/Careers.aspx',
                'is_active'             => true,
                'is_featured'           => false,
                'is_government_partner' => true,
                'is_urgent'             => false,
                'posted_at'             => now()->subDays(5),
            ],
        ];

        foreach ($jobs as $data) {
            Job::firstOrCreate(
                ['title' => $data['title'], 'company' => $data['company']],
                $data
            );
        }
    }
}
