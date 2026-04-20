<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ResumeBuilderController extends Controller
{
    public function save(Request $request)
    {
        $request->validate([
            'resume_data' => 'required|array',
        ]);

        $user = $request->user();
        $user->update(['resume_data' => $request->resume_data]);

        return response()->json([
            'id'           => $user->id,
            'preview_html' => null,
            'message'      => 'تم حفظ السيرة الذاتية بنجاح',
        ]);
    }

    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'resume_data' => $user->resume_data,
        ]);
    }
}
