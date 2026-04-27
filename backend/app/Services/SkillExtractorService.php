<?php

namespace App\Services;

// NEW
class SkillExtractorService
{
    private array $technicalSkills = [
        'php', 'laravel', 'javascript', 'react', 'node', 'sql', 'api', 'html', 'css',
    ];

    private array $tools = [
        'docker', 'aws', 'git', 'github', 'linux',
    ];

    private array $softSkills = [
        'communication', 'leadership', 'teamwork', 'problem solving',
    ];

    public function extract(string $text): array
    {
        $normalized = strtolower($text);

        return [
            'skills'      => $this->match($normalized, $this->technicalSkills),
            'tools'       => $this->match($normalized, $this->tools),
            'soft_skills' => $this->match($normalized, $this->softSkills),
        ];
    }

    private function match(string $text, array $keywords): array
    {
        $found = [];

        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $found[] = $keyword;
            }
        }

        return array_values(array_unique($found));
    }
}
