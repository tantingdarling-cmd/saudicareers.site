<?php

namespace App\Http\Controllers\Api;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    // POST /api/v1/analytics/events — log a single event
    public function store(Request $request)
    {
        $data = $request->validate([
            'event_type' => 'required|in:alert_sent,alert_clicked,application_submitted',
            'campaign'   => 'nullable|string|max:128',
        ]);

        AnalyticsEvent::log(
            $data['event_type'],
            $request->user()?->id,
            $data['campaign'] ?? null
        );

        return response()->json(['ok' => true], 201);
    }

    // GET /api/v1/analytics/conversions?campaign=organic_w2&days=7
    public function conversions(Request $request)
    {
        $campaign = $request->get('campaign');
        $days     = (int) $request->get('days', 7);
        $cacheKey = 'analytics:conv:' . md5($campaign . ':' . $days);

        $result = Cache::remember($cacheKey, 300, function () use ($campaign, $days) {
            $since = now()->subDays($days)->startOfDay();

            $query = fn ($type) => AnalyticsEvent::where('event_type', $type)
                ->where('created_at', '>=', $since)
                ->when($campaign, fn ($q) => $q->where('campaign', $campaign))
                ->count();

            return [
                'sent'    => $query('alert_sent'),
                'clicked' => $query('alert_clicked'),
                'applied' => $query('application_submitted'),
                'campaign' => $campaign,
                'days'     => $days,
            ];
        });

        return response()->json($result);
    }

    // GET /api/v1/analytics/week — current week funnel (admin)
    public function week()
    {
        $cacheKey = 'analytics:week:' . now()->format('Y-W');

        $result = Cache::remember($cacheKey, 300, function () {
            $since = now()->startOfWeek();

            $row = fn ($type) => AnalyticsEvent::where('event_type', $type)
                ->where('created_at', '>=', $since)
                ->count();

            return [
                'alert_sent'             => $row('alert_sent'),
                'alert_clicked'          => $row('alert_clicked'),
                'application_submitted'  => $row('application_submitted'),
                'week_start'             => $since->toDateString(),
            ];
        });

        return response()->json($result);
    }
}
