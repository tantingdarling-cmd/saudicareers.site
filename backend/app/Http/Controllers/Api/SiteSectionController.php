<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSection;
use Illuminate\Http\Request;

class SiteSectionController extends Controller
{
    public function index()
    {
        return response()->json(
            SiteSection::where('is_active', true)->orderBy('order')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'key'       => 'required|string|unique:site_sections,key',
            'title'     => 'required|string|max:255',
            'content'   => 'nullable|array',
            'is_active' => 'boolean',
            'order'     => 'integer',
        ]);

        return response()->json(SiteSection::create($data), 201);
    }

    public function update(Request $request, SiteSection $section)
    {
        $data = $request->validate([
            'title'     => 'sometimes|string|max:255',
            'content'   => 'nullable|array',
            'is_active' => 'boolean',
            'order'     => 'integer',
        ]);

        $section->update($data);

        return response()->json($section);
    }

    public function destroy(SiteSection $section)
    {
        $section->delete();

        return response()->json(null, 204);
    }
}
