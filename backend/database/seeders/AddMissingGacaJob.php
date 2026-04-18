<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;

class AddMissingGacaJob extends Seeder
{
    public function run(): void
    {
        Job::firstOrCreate(
            ['title' => 'موظفي عمليات الأمتعة', 'company' => 'الهيئة العامة للطيران المدني (GACA)'],
            [
                'title_en'              => 'Baggage Operations Staff',
                'location'              => 'مطار الملك عبد العزيز الدولي، جدة',
                'description'           => 'في الميدان • الشواغر: 32 — الإشراف على عمليات الأمتعة وضمان سلامة المسافرين وفق معايير الهيئة العامة للطيران المدني.',
                'requirements'          => 'ثانوية عامة فأعلى. خبرة في العمليات الميدانية. اللياقة البدنية. استعداد للعمل بنظام الورديات.',
                'category'              => 'tech',
                'job_type'              => 'full_time',
                'experience_level'      => 'senior',
                'salary_min'            => 10000,
                'salary_max'            => 15000,
                'salary_currency'       => 'SAR',
                'apply_url'             => 'https://www.gaca.gov.sa/arabic/Pages/Careers.aspx',
                'is_active'             => true,
                'is_featured'           => false,
                'is_government_partner' => true,
                'is_urgent'             => true,
                'posted_at'             => now(),
            ]
        );
    }
}
