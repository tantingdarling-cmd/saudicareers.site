<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function uploadResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|max:5120|mimes:pdf,docx',
        ]);

        $user = $request->user();

        // Delete old file if exists
        if ($user->resume_path) {
            Storage::disk('public')->delete($user->resume_path);
        }

        $path = $request->file('resume')->store('resumes', 'public');

        $user->update(['resume_path' => $path]);

        return response()->json([
            'message'     => 'تم رفع السيرة الذاتية بنجاح',
            'resume_path' => $path,
            'resume_url'  => Storage::disk('public')->url($path),
        ]);
    }

    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'resume_path' => $user->resume_path,
            'resume_url'  => $user->resume_path
                ? Storage::disk('public')->url($user->resume_path)
                : null,
        ]);
    }
}
