<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryStatsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Job::active()
            ->whereNotNull('salary_min')
            ->whereNotNull('salary_max')
            ->where('salary_min', '>', 0);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('location')) {
            $query->where('location', 'LIKE', '%' . $request->location . '%');
        }

        $jobs = $query->get(['salary_min', 'salary_max', 'experience_level', 'category', 'location']);

        if ($jobs->isEmpty()) {
            return response()->json(['overall' => null, 'by_experience' => [], 'by_category' => [], 'by_location' => []]);
        }

        $midpoint = fn($j) => ($j->salary_min + $j->salary_max) / 2;

        $byExperience = $jobs->groupBy('experience_level')
            ->map(fn($g) => [
                'level'  => $g->first()->experience_level,
                'min'    => (int) $g->min('salary_min'),
                'max'    => (int) $g->max('salary_max'),
                'avg'    => (int) $g->avg($midpoint),
                'count'  => $g->count(),
            ])
            ->sortBy(fn($v) => match($v['level']) {
                'entry' => 1, 'mid' => 2, 'senior' => 3, 'lead' => 4, 'executive' => 5, default => 6,
            })
            ->values();

        $byCategory = $jobs->groupBy('category')
            ->map(fn($g) => [
                'category' => $g->first()->category,
                'avg'      => (int) $g->avg($midpoint),
                'count'    => $g->count(),
            ])
            ->sortByDesc('avg')
            ->values();

        $byLocation = $jobs->groupBy('location')
            ->map(fn($g) => [
                'location' => $g->first()->location,
                'avg'      => (int) $g->avg($midpoint),
                'count'    => $g->count(),
            ])
            ->sortByDesc('avg')
            ->take(8)
            ->values();

        $allMids = $jobs->map($midpoint)->sort()->values();
        $mid = (int) floor($allMids->count() / 2);

        return response()->json([
            'overall'       => [
                'min'    => (int) $jobs->min('salary_min'),
                'max'    => (int) $jobs->max('salary_max'),
                'avg'    => (int) $allMids->avg(),
                'median' => $allMids->count() ? (int) $allMids[$mid] : 0,
                'count'  => $jobs->count(),
            ],
            'by_experience' => $byExperience,
            'by_category'   => $byCategory,
            'by_location'   => $byLocation,
        ]);
    }
}
