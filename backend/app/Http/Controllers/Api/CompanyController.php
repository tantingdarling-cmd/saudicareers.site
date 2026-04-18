<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $company = Company::where('slug', $slug)
            ->withCount(['activeJobs'])
            ->firstOrFail();

        $jobs = $company->activeJobs()
            ->select('id', 'title', 'location', 'job_type', 'category', 'posted_at', 'salary_min', 'salary_max')
            ->latest('posted_at')
            ->get()
            ->map(fn ($j) => [
                'id'       => $j->id,
                'title'    => $j->title,
                'location' => $j->location,
                'job_type' => $j->job_type,
                'category' => $j->category,
                'posted_at'=> $j->posted_at?->diffForHumans(),
            ]);

        return response()->json([
            'id'               => $company->id,
            'name'             => $company->name,
            'slug'             => $company->slug,
            'logo'             => $company->logo,
            'about'            => $company->about,
            'location'         => $company->location,
            'website'          => $company->website,
            'active_jobs_count'=> $company->active_jobs_count,
            'jobs'             => $jobs,
        ]);
    }
}
