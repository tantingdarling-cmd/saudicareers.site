<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProbationRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProbationController extends Controller
{
    // ── GET /admin/probation ──────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = ProbationRecord::with(['application', 'createdBy:id,name'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->paginate(20);

        // أضف الحقول المحسوبة لكل سجل
        $records->getCollection()->transform(fn ($r) => $this->appendComputed($r));

        return response()->json($records);
    }

    // ── GET /admin/probation/{id}/status ─────────────────────────────────────

    public function status(ProbationRecord $probation): JsonResponse
    {
        return response()->json($this->appendComputed($probation->load('createdBy:id,name')));
    }

    // ── POST /admin/probation ─────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_name'  => 'required|string|max:120',
            'employee_email' => 'required|email|max:120',
            'application_id' => 'nullable|exists:job_applications,id',
            // نظام العمل السعودي — المادة 53: لا تتجاوز 90 يوماً في المرة الأولى
            'start_date'     => 'required|date|before_or_equal:today',
            'duration_days'  => [
                'sometimes', 'integer',
                'min:1',
                'max:' . ProbationRecord::MAX_DAYS, // Art.53
            ],
        ], [
            'duration_days.max' => 'لا يمكن أن تتجاوز مدة التجربة الابتدائية 90 يوماً وفق المادة 53 من نظام العمل.',
            'start_date.before_or_equal' => 'تاريخ البداية لا يمكن أن يكون في المستقبل.',
        ]);

        $data['created_by']    = $request->user()->id;
        $data['duration_days'] = $data['duration_days'] ?? ProbationRecord::MAX_DAYS;

        $record = ProbationRecord::create($data);

        return response()->json($this->appendComputed($record), 201);
    }

    // ── POST /admin/probation/{id}/extend ────────────────────────────────────

    public function extend(Request $request, ProbationRecord $probation): JsonResponse
    {
        if (! $probation->canExtend()) {
            return response()->json([
                'message' => 'لا يمكن تمديد هذه الفترة. إما أنها ممتدة مسبقاً أو منتهية.',
                // نظام العمل السعودي — المادة 53: التمديد مرة واحدة فقط
                'law_ref' => 'نظام العمل — المادة 53',
            ], 422);
        }

        $request->validate([
            // الملف إلزامي — الموافقة الخطية شرط قانوني (Art.53)
            'extension_docs' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'duration_days'  => [
                'sometimes', 'integer',
                'min:' . ($probation->duration_days + 1),
                // نظام العمل السعودي — المادة 53: الحد الأقصى الإجمالي 180 يوماً
                'max:' . ProbationRecord::MAX_EXTENDED_DAYS,
            ],
        ], [
            'extension_docs.required' => 'ملف الموافقة الخطية إلزامي وفق المادة 53 من نظام العمل.',
            'duration_days.max'       => 'لا يمكن أن يتجاوز إجمالي فترة التجربة 180 يوماً وفق المادة 53 من نظام العمل.',
        ]);

        $path = $request->file('extension_docs')
            ->store('probation/extensions', 'local');

        $probation->update([
            'extended'       => true,
            'extension_docs' => $path,
            'duration_days'  => $request->input('duration_days', ProbationRecord::MAX_EXTENDED_DAYS),
            'status'         => 'extended',
        ]);

        return response()->json($this->appendComputed($probation->fresh()));
    }

    // ── مساعد: أضف الحقول المحسوبة للاستجابة ────────────────────────────────

    private function appendComputed(ProbationRecord $r): array
    {
        return array_merge($r->toArray(), [
            'end_date'         => $r->end_date->toDateString(),
            'remaining_days'   => $r->remaining_days,
            'progress_percent' => $r->progress_percent,
            'is_expired'       => $r->isExpired(),
            'can_extend'       => $r->canExtend(),
            // نظام العمل السعودي — المادة 53 (للـ client ليعرض المرجع القانوني)
            'law_ref'          => 'نظام العمل — المادة 53',
        ]);
    }
}
