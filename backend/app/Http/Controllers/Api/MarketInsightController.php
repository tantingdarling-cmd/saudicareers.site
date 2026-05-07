<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\InvalidateSimilarCache;
use App\Models\MarketInsight;
use App\Services\RadarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarketInsightController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MarketInsight::published();

        if ($request->filled('output_type')) {
            $query->ofType($request->input('output_type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $perPage = (int) $request->input('per_page', 12);
        $insights = $query->orderBy('published_at', 'desc')->paginate($perPage);

        return response()->json($insights);
    }

    public function webhook(Request $request): JsonResponse
    {
        $secret = env('RADAR_WEBHOOK_SECRET');
        $signature = $request->header('X-Radar-Signature');
        $payload = $request->getContent();

        if (!$signature || !$secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expected, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $data = $request->validate([
            'id'              => 'required|integer',
            'output_type'     => 'required|string',
            'output_text'     => 'required|string',
            'category'        => 'nullable|string',
            'sentiment_label' => 'nullable|string',
            'sentiment_score' => 'nullable|numeric',
            'source'          => 'nullable|string',
            'vector_id'       => 'nullable|string',
        ]);

        $body  = $data['output_text'];
        $title = mb_substr(strip_tags($body), 0, 80);

        $insight = MarketInsight::create([
            'radar_id'        => $data['id'],
            'radar_vector_id' => $data['vector_id'] ?? null,
            'output_type'     => $data['output_type'],
            'body'            => $body,
            'title'           => $title,
            'category'        => $data['category'] ?? null,
            'sentiment_label' => $data['sentiment_label'] ?? null,
            'sentiment_score' => $data['sentiment_score'] ?? null,
            'source'          => $data['source'] ?? null,
            'is_published'    => true,
            'published_at'    => now(),
        ]);

        if ($insight->radar_vector_id) {
            InvalidateSimilarCache::dispatch($insight->radar_vector_id);
        }

        return response()->json($insight, 201);
    }

    public function similar(MarketInsight $insight, RadarService $radar): JsonResponse
    {
        if (!$insight->radar_vector_id) {
            return response()->json(['data' => [], 'message' => 'No vector index for this insight'], 200);
        }

        $similar = $radar->getSimilarJobs($insight->radar_vector_id);

        return response()->json(['data' => $similar]);
    }
}
