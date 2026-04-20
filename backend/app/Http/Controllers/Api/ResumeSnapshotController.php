<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResumeSnapshot;
use Illuminate\Http\Request;

class ResumeSnapshotController extends Controller
{
    public function index(Request $request)
    {
        $snapshots = ResumeSnapshot::where('user_id', $request->user()->id)
            ->latest()
            ->get(['id', 'name', 'template', 'updated_at', 'created_at']);

        return response()->json(['data' => $snapshots]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'nullable|string|max:120',
            'template' => 'nullable|string|in:classic,modern,creative',
            'data'     => 'required|array',
        ]);

        $snapshot = ResumeSnapshot::create([
            'user_id'  => $request->user()->id,
            'name'     => $request->name ?? ($request->data['name'] ?? 'سيرتي الذاتية'),
            'template' => $request->template ?? 'classic',
            'data'     => $request->data,
        ]);

        return response()->json(['id' => $snapshot->id, 'message' => 'تم الحفظ بنجاح'], 201);
    }

    public function update(Request $request, $id)
    {
        $snapshot = ResumeSnapshot::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'name'     => 'nullable|string|max:120',
            'template' => 'nullable|string|in:classic,modern,creative',
            'data'     => 'required|array',
        ]);

        $snapshot->update([
            'name'     => $request->name ?? ($request->data['name'] ?? $snapshot->name),
            'template' => $request->template ?? $snapshot->template,
            'data'     => $request->data,
        ]);

        return response()->json(['id' => $snapshot->id, 'message' => 'تم التحديث بنجاح']);
    }

    public function show(Request $request, $id)
    {
        $snapshot = ResumeSnapshot::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'id'         => $snapshot->id,
            'name'       => $snapshot->name,
            'template'   => $snapshot->template,
            'data'       => $snapshot->data,
            'updated_at' => $snapshot->updated_at,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $snapshot = ResumeSnapshot::where('user_id', $request->user()->id)->findOrFail($id);
        $snapshot->delete();

        return response()->json(['message' => 'تم الحذف']);
    }
}
