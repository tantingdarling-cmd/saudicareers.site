<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'company' => 'sometimes|string|max:255',
            'company_logo' => 'nullable|string|max:500',
            'location' => 'sometimes|string|max:255',
            'salary_min' => 'nullable|integer|min:0',
            'salary_max' => 'nullable|integer|min:0|gte:salary_min',
            'description' => 'sometimes|string',
            'requirements' => 'nullable|string',
            'category' => 'sometimes|in:tech,finance,energy,construction,hr,marketing,healthcare,education,other',
            'job_type' => 'sometimes|in:full_time,part_time,contract,internship,remote',
            'experience_level' => 'sometimes|in:entry,mid,senior,lead,executive',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'apply_url' => 'nullable|url',
            'posted_at' => 'nullable|date',
        ];
    }
}
