<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareerTip;
use App\Http\Resources\CareerTipResource;
use App\Http\Resources\CareerTipCollection;
use Illuminate\Http\Request;

class CareerTipController extends Controller
{
    public function index(Request $request)
    {
        $query = CareerTip::published();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->q}%")
                  ->orWhere('excerpt', 'LIKE', "%{$request->q}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $perPage = $request->input('per_page', 10);
        $tips = $query->latest('published_at')->paginate($perPage);

        return new CareerTipCollection($tips);
    }

    public function show(CareerTip $tip)
    {
        return new CareerTipResource($tip);
    }
}
