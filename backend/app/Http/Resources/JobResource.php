<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'title_en' => $this->title_en,
            'company' => $this->company,
            'company_logo' => $this->company_logo,
            'company_slug' => $this->relationLoaded('company') ? $this->getRelation('company')?->slug : null,
            'location' => $this->location,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary' => $this->salary_min && $this->salary_max 
                ? number_format($this->salary_min) . ' - ' . number_format($this->salary_max) . ' ر.س'
                : null,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'category' => $this->category,
            'category_label' => $this->getCategoryLabel(),
            'job_type' => $this->job_type,
            'job_type_label' => $this->getJobTypeLabel(),
            'experience_level' => $this->experience_level,
            'is_featured' => $this->is_featured,
            'apply_url' => $this->apply_url,
            'posted_at' => $this->posted_at?->diffForHumans(),
            'created_at' => $this->created_at,
        ];
    }
    
    private function getCategoryLabel(): string
    {
        return match($this->category) {
            'tech' => 'تقنية',
            'finance' => 'مالية',
            'energy' => 'طاقة',
            'construction' => 'إنشاءات',
            'hr' => 'موارد بشرية',
            'marketing' => 'تسويق',
            'healthcare' => 'صحة',
            'education' => 'تعليم',
            default => 'أخرى',
        };
    }
    
    private function getJobTypeLabel(): string
    {
        return match($this->job_type) {
            'full_time' => 'دوام كامل',
            'part_time' => 'دوام جزئي',
            'contract' => 'عقد',
            'internship' => 'تدريب',
            'remote' => 'عن بعد',
            default => 'غير محدد',
        };
    }
}
