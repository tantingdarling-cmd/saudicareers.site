<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\CareerTip;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
        ]);

        Job::insert([
            [
                'title' => 'مطور تطبيقات React',
                'title_en' => 'React Developer',
                'company' => 'نيوم (NEOM)',
                'company_logo' => null,
                'location' => 'الرياض',
                'salary_min' => 15000,
                'salary_max' => 25000,
                'description' => 'نبحث عن مطور React متمكن للانضمام إلى فريقنا التقني في مشروع نيوم.',
                'requirements' => 'خبرة 3+ سنوات في React\nإتقان TypeScript\nمعرفة بـ Next.js',
                'category' => 'tech',
                'job_type' => 'full_time',
                'experience_level' => 'mid',
                'is_active' => true,
                'is_featured' => true,
                'posted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'محاسب مالي',
                'title_en' => 'Financial Accountant',
                'company' => 'أرامكو',
                'company_logo' => null,
                'location' => 'الدمام',
                'salary_min' => 18000,
                'salary_max' => 30000,
                'description' => 'محاسب مالي خبرة في النظم المحاسبية السعودية.',
                'requirements' => 'CPA أو معادل\nخبرة 5+ سنوات\nمعرفة بأنظمة زود',
                'category' => 'finance',
                'job_type' => 'full_time',
                'experience_level' => 'senior',
                'is_active' => true,
                'is_featured' => true,
                'posted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'مهندس مشاريع',
                'title_en' => 'Project Engineer',
                'company' => 'صندوق الاستثمارات العامة (PIF)',
                'company_logo' => null,
                'location' => 'الرياض',
                'salary_min' => 20000,
                'salary_max' => 35000,
                'description' => 'مهندس مشاريع للعمل في مشاريع صندوق الاستثمارات العامة.',
                'requirements' => 'هندسة مدنية أو معمارية\nPMP认证\nخبرة 7+ سنوات',
                'category' => 'construction',
                'job_type' => 'full_time',
                'experience_level' => 'senior',
                'is_active' => true,
                'is_featured' => false,
                'posted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        CareerTip::insert([
            [
                'title' => 'كيف تكتب سيرة ذاتية احترافية',
                'slug' => 'how-to-write-professional-cv',
                'excerpt' => 'تعرف على أسرار كتابة سيرة ذاتية تجذب انتباه أصحاب العمل.',
                'content' => '<p>السيرة الذاتية الاحترافية هي بوابتك الأولى للحصول على الوظيفة...</p>',
                'category' => 'cv',
                'author' => 'فريق سعودي كاريرز',
                'is_published' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'أخطاء شائعة في المقابلات',
                'slug' => 'common-interview-mistakes',
                'excerpt' => 'تجنب هذه الأخطاء الشائعة في مقابلات العمل.',
                'content' => '<p>المقابلة الشخصية هي فرصة ذهبية...</p>',
                'category' => 'interview',
                'author' => 'فريق سعودي كاريرز',
                'is_published' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
