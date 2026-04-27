<?php

namespace App\Services;

// NEW
class SkillMatcherService
{
    public function match(array $resumeSkills, array $jobSkills): array
    {
        if (empty($jobSkills)) {
            return ['matched' => [], 'missing' => [], 'score' => 0];
        }

        $matched = array_values(array_intersect($jobSkills, $resumeSkills));
        $missing = array_values(array_diff($jobSkills, $resumeSkills));
        $score   = (int) round((count($matched) / count($jobSkills)) * 100);

        return compact('matched', 'missing', 'score');
    }
}
