<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    protected $model = Job::class;

    /**
     * وظيفة افتراضية عامة — كافية لمعظم الاختبارات.
     */
    public function definition(): array
    {
        return [
            'title'            => 'مطور ويب',
            'title_en'         => 'Web Developer',
            'company'          => 'شركة التقنية السعودية',
            'location'         => 'الرياض',
            'description'      => 'نبحث عن مطور ويب senior محترف متخصص في PHP و Laravel و JavaScript و React.',
            'requirements'     => 'بكالوريوس هندسة علوم حاسب. خبرة 5 سنوات في تطوير الويب. خبير في قواعد البيانات.',
            'category'         => 'tech',
            'job_type'         => 'full_time',
            'experience_level' => 'senior',
            'is_active'        => true,
            'is_featured'      => false,
            'posted_at'        => now(),
        ];
    }

    /**
     * وظيفة تضمن درجة مطابقة عالية (≥80) عند استخدامها مع highMatchCoverLetter().
     */
    public function highMatch(): static
    {
        return $this->state([
            'description'  => 'نبحث عن مطور ويب senior خبير في PHP Laravel JavaScript React وقواعد بيانات MySQL. دوام كامل في الرياض.',
            'requirements' => 'بكالوريوس هندسة علوم حاسب أو تقنية معلومات. خبرة senior متخصص 5 سنوات. fulltime.',
            'category'         => 'tech',
            'job_type'         => 'full_time',
            'experience_level' => 'senior',
        ]);
    }

    /**
     * وظيفة تضمن درجة مطابقة منخفضة بغض النظر عن رسالة التقديم.
     */
    public function lowMatch(): static
    {
        return $this->state([
            'description'  => 'وظيفة شاغرة متخصصة في مجال طبي نادر.',
            'requirements' => 'شهادة طب وخبرة جراحية متخصصة.',
            'category'         => 'healthcare',
            'job_type'         => 'full_time',
            'experience_level' => 'senior',
        ]);
    }
}
