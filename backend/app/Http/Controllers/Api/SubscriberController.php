<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use App\Http\Resources\SubscriberResource;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:subscribers,email',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'field' => 'nullable|string|max:100',
        ]);
        
        $subscriber = Subscriber::create([
            ...$validated,
            'subscribed_at' => now(),
            'is_active' => true,
        ]);
        
        return response()->json([
            'message' => 'تم الاشتراك بنجاح',
            'data' => new SubscriberResource($subscriber)
        ], 201);
    }
    
    public function index(Request $request)
    {
        $query = Subscriber::query();
        
        if ($request->has('active')) {
            $query->where('is_active', $request->active);
        }
        
        $subscribers = $query->latest()->paginate(50);
        
        return SubscriberResource::collection($subscribers);
    }
}
