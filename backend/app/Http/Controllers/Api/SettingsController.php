<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // ── GET /api/v1/settings/public ──────────────────────────────────────────
    // Public: يعيد فقط الإعدادات ذات is_public=true
    // يُستخدم من الـ frontend لحقن GA/GTM/Pixel بدون Sanctum

    public function public(\App\Services\SeoService $seo): JsonResponse
    {
        $settings = Setting::where('is_public', true)
            ->get(['key', 'value', 'type', 'group'])
            ->keyBy('key')
            ->map(fn ($s) => $s->casted_value);

        // أضف بيانات Schema.org العامة للموقع
        $settings['site_schema'] = $seo->siteSchema();

        return response()->json($settings);
    }

    // ── GET /api/admin/settings ──────────────────────────────────────────────
    // Admin: يعيد كل الإعدادات مع label و description لعرضها في لوحة التحكم

    public function index(): JsonResponse
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get();

        $grouped = $settings->groupBy('group')->map(fn ($group) =>
            $group->map(fn ($s) => [
                'key'         => $s->key,
                'value'       => $s->value,
                'type'        => $s->type,
                'label'       => $s->label,
                'description' => $s->description,
                'is_public'   => $s->is_public,
            ])
        );

        return response()->json($grouped);
    }

    // ── PATCH /api/admin/settings/{key} ─────────────────────────────────────

    public function update(Request $request, string $key): JsonResponse
    {
        $setting = Setting::findOrFail($key);

        $request->validate([
            'value' => 'nullable|string|max:5000',
        ]);

        $setting->update(['value' => $request->input('value')]);

        return response()->json([
            'message' => 'تم تحديث الإعداد بنجاح',
            'key'     => $key,
            'value'   => $setting->fresh()->casted_value,
        ]);
    }
}
