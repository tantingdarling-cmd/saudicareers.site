<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;

class GacaPartnerSeeder extends Seeder
{
    public function run(): void
    {
        Job::firstOrCreate(
            ['title' => 'محلل بيانات الطيران', 'company' => 'الهيئة العامة للطيران المدني'],
            [
                'title_en'              => 'Aviation Data Analyst',
                'company'               => 'الهيئة العامة للطيران المدني',
                'location'              => 'الرياض',
                'category'              => 'tech',
                'job_type'              => 'full_time',
                'experience_level'      => 'mid',
                'salary_min'            => 12000,
                'salary_max'            => 18000,
                'salary_currency'       => 'SAR',
                'description'           => 'تبحث الهيئة العامة للطيران المدني عن محلل بيانات متخصص لدعم قرارات تطوير قطاع الطيران ضمن أهداف رؤية 2030.',
                'requirements'          => 'بكالوريوس تقنية معلومات أو إحصاء، خبرة لا تقل عن سنتين في تحليل البيانات، إلمام بـ Python أو SQL.',
                'apply_url'             => 'https://www.gaca.gov.sa',
                'is_active'             => true,
                'is_featured'           => false,
                'is_government_partner' => true,
                'posted_at'             => now(),
            ]
        );
    }
}
