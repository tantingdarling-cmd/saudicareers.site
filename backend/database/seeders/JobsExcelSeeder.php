<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;
use Carbon\Carbon;

class JobsExcelSeeder extends Seeder
{
    private const VALID_CATEGORIES = [
        'tech', 'finance', 'energy', 'construction',
        'hr', 'marketing', 'healthcare', 'education', 'other',
    ];

    public function run(): void
    {
        $dataFile = database_path('seeders/jobs_excel_data.json');
        $jobs = json_decode(file_get_contents($dataFile), true);

        $inserted = 0;
        foreach ($jobs as $row) {
            $category = in_array($row['category'], self::VALID_CATEGORIES)
                ? $row['category']
                : 'other';

            Job::create([
                'title'            => $row['title'],
                'title_en'         => $row['title_en'] ?: null,
                'company'          => $row['company'],
                'location'         => $row['location'],
                'description'      => $row['description'],
                'requirements'     => $row['requirements'] ?: null,
                'category'         => $category,
                'job_type'         => $row['job_type'] ?: 'full_time',
                'experience_level' => $row['experience_level'] ?: 'mid',
                'salary_min'       => $row['salary_min'] ? (int) $row['salary_min'] : null,
                'salary_max'       => $row['salary_max'] ? (int) $row['salary_max'] : null,
                'apply_url'        => $row['apply_url'] ?: null,
                'is_featured'      => $row['is_featured'] === 'نعم',
                'is_active'        => $row['is_active'] !== 'لا',
                'post_status'      => 'active',
                'posted_at'        => Carbon::now()->subDays(rand(0, 14)),
            ]);
            $inserted++;
        }

        $this->command->info("Inserted {$inserted} jobs from Excel.");
    }
}
