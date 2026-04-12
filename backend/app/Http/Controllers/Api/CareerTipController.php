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
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        $tips = $query->latest()->paginate(10);
        
        return new CareerTipCollection($tips);
    }

    public function show(CareerTip $tip)
    {
        return new CareerTipResource($tip);
    }
}
