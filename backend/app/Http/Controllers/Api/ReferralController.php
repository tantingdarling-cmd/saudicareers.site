<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Routing\Controller;

class ReferralController extends Controller
{
    // POST /api/v1/referral/{userId} — increment referral_count for referrer
    public function track(int $userId)
    {
        $user = User::find($userId);
        if ($user) {
            $user->increment('referral_count');
        }

        return response()->json(['ok' => true]);
    }

    // GET /api/v1/referral/my — returns current user's referral_count
    public function my(\Illuminate\Http\Request $request)
    {
        return response()->json(['count' => $request->user()->referral_count ?? 0]);
    }
}
