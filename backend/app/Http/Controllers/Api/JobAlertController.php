<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobAlert;
use Illuminate\Http\Request;

class JobAlertController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => $request->user()->jobAlerts()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'keyword'   => 'nullable|string|max:100',
            'location'  => 'nullable|string|max:100',
            'frequency' => 'nullable|in:instant,daily,weekly',
        ]);

        $alert = $request->user()->jobAlerts()->create(
            array_merge($validated, ['active' => true])
        );

        return response()->json(['data' => $alert], 201);
    }

    public function destroy(Request $request, JobAlert $alert)
    {
        if ($alert->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $alert->delete();
        return response()->json(['deleted' => true]);
    }

    public function toggle(Request $request, JobAlert $alert)
    {
        if ($alert->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $alert->update(['active' => !$alert->active]);
        return response()->json(['data' => $alert->fresh()]);
    }
}
