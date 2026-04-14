<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Http\Resources\JobResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BulkJobController extends Controller
{
    /**
     * POST /api/admin/jobs/bulk
     *
     * يقبل JSON array أو CSV file يحتوي على وظائف متعددة.
     * يُعيد ملخص: عدد الناجحة، الفاشلة، مع تفاصيل الأخطاء.
     */
    public function store(Request $request)
    {
        // ── JSON import ─────────────────────────────────────────────
        if ($request->isJson() || $request->has('jobs')) {
            return $this->importFromJson($request);
        }

        // ── CSV import ──────────────────────────────────────────────
        if ($request->hasFile('csv')) {
            return $this->importFromCsv($request);
        }

        return response()->json([
            'message' => 'أرسل jobs[] كـ JSON أو ملف csv',
        ], 422);
    }

    // ────────────────────────────────────────────────────────────────
    private function importFromJson(Request $request): \Illuminate\Http\JsonResponse
    {
        $rows = $request->input('jobs', []);

        if (empty($rows) || !is_array($rows)) {
            return response()->json(['message' => 'المصفوفة jobs فارغة أو غير صحيحة'], 422);
        }

        if (count($rows) > 500) {
            return response()->json(['message' => 'الحد الأقصى 500 وظيفة في الطلب الواحد'], 422);
        }

        return $this->processRows($rows);
    }

    // ────────────────────────────────────────────────────────────────
    private function importFromCsv(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'csv' => 'required|file|mimes:csv,txt|max:2048', // 2MB max
        ]);

        $path = $request->file('csv')->getRealPath();
        $handle = fopen($path, 'r');

        if (!$handle) {
            return response()->json(['message' => 'تعذّر قراءة الملف'], 422);
        }

        // السطر الأول = headers
        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            return response()->json(['message' => 'الملف فارغ'], 422);
        }

        $headers = array_map('trim', $headers);
        $rows = [];

        while (($line = fgetcsv($handle)) !== false) {
            if (count($line) === count($headers)) {
                $rows[] = array_combine($headers, array_map('trim', $line));
            }
        }
        fclose($handle);

        return $this->processRows($rows);
    }

    // ────────────────────────────────────────────────────────────────
    private function processRows(array $rows): \Illuminate\Http\JsonResponse
    {
        $created = [];
        $errors  = [];

        $rules = [
            'title'            => 'required|string|max:255',
            'company'          => 'required|string|max:255',
            'location'         => 'required|string|max:255',
            'description'      => 'required|string',
            'category'         => 'required|in:tech,finance,energy,construction,hr,marketing,healthcare,education,other',
            'job_type'         => 'required|in:full_time,part_time,contract,internship,remote',
            'experience_level' => 'required|in:entry,mid,senior,lead,executive',
            'salary_min'       => 'nullable|integer|min:0',
            'salary_max'       => 'nullable|integer|min:0',
            'requirements'     => 'nullable|string',
            'apply_url'        => 'nullable|url',
            'is_featured'      => 'nullable|boolean',
            'is_active'        => 'nullable|boolean',
        ];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 1;

            // تنظيف القيم الفارغة
            $row = array_map(fn($v) => $v === '' ? null : $v, $row);

            // تحويل النصوص إلى boolean
            foreach (['is_featured', 'is_active'] as $field) {
                if (isset($row[$field])) {
                    $row[$field] = filter_var($row[$field], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;
                }
            }

            $validator = Validator::make($row, $rules);

            if ($validator->fails()) {
                $errors[] = [
                    'row'    => $rowNum,
                    'title'  => $row['title'] ?? "(بدون عنوان)",
                    'errors' => $validator->errors()->toArray(),
                ];
                continue;
            }

            $job = Job::create([
                'title'            => $row['title'],
                'title_en'         => $row['title_en'] ?? null,
                'company'          => $row['company'],
                'location'         => $row['location'],
                'description'      => $row['description'],
                'requirements'     => $row['requirements'] ?? null,
                'category'         => $row['category'],
                'job_type'         => $row['job_type'],
                'experience_level' => $row['experience_level'],
                'salary_min'       => $row['salary_min'] ? (int)$row['salary_min'] : null,
                'salary_max'       => $row['salary_max'] ? (int)$row['salary_max'] : null,
                'apply_url'        => $row['apply_url'] ?? null,
                'is_featured'      => $row['is_featured'] ?? false,
                'is_active'        => $row['is_active'] ?? true,
                'posted_at'        => now(),
            ]);

            $created[] = ['id' => $job->id, 'title' => $job->title];
        }

        return response()->json([
            'message'       => "تم الاستيراد: {$this->count($created)} ناجحة، {$this->count($errors)} فاشلة",
            'summary'       => [
                'total'    => count($rows),
                'created'  => count($created),
                'failed'   => count($errors),
            ],
            'created'       => $created,
            'errors'        => $errors,
        ], count($errors) === count($rows) ? 422 : 201);
    }

    private function count(array $arr): int
    {
        return count($arr);
    }
}
