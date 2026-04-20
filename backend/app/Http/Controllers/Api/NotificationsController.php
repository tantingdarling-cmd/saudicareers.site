<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlertNotification;
use Illuminate\Http\Request;

class NotificationsController extends Controller
{
    public function index(Request $request)
    {
        $items = AlertNotification::where('user_id', $request->user()->id)
            ->latest()
            ->take(30)
            ->get();

        return response()->json(['data' => $items]);
    }

    public function unread(Request $request)
    {
        $q = AlertNotification::where('user_id', $request->user()->id)->whereNull('read_at');

        return response()->json([
            'count' => $q->count(),
            'data'  => $q->latest()->take(5)->get(),
        ]);
    }

    public function markRead(Request $request, $id)
    {
        AlertNotification::where('user_id', $request->user()->id)
            ->findOrFail($id)
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request)
    {
        AlertNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
