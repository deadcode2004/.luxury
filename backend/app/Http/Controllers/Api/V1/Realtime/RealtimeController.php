<?php

namespace App\Http\Controllers\Api\V1\Realtime;

use App\Http\Controllers\Controller;
use App\Services\Realtime\RealtimeHub;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RealtimeController extends Controller
{
    public function __construct(private readonly RealtimeHub $hub) {}

    /**
     * Lightweight domain versions — clients poll this and refetch only on change.
     */
    public function versions(): JsonResponse
    {
        return ApiResponse::success([
            'cursor' => $this->hub->cursor(),
            'versions' => $this->hub->versions(),
        ]);
    }

    /**
     * Optional event feed for debugging / rich clients.
     */
    public function events(Request $request): JsonResponse
    {
        $since = max(0, (int) $request->query('since', 0));
        $domainsParam = $request->query('domains');
        $domains = null;

        if (is_string($domainsParam) && $domainsParam !== '') {
            $domains = array_values(array_filter(array_map('trim', explode(',', $domainsParam))));
        }

        $isOwner = $request->user()?->isOwner() === true;
        if (! $isOwner) {
            $public = [
                RealtimeHub::DOMAIN_PRODUCTS,
                RealtimeHub::DOMAIN_CATEGORIES,
                RealtimeHub::DOMAIN_CMS,
            ];
            $domains = $domains !== null
                ? array_values(array_intersect($domains, $public))
                : $public;
        }

        return ApiResponse::success([
            'cursor' => $this->hub->cursor(),
            'versions' => $this->hub->versions(),
            'events' => $this->hub->eventsSince($since, $domains),
        ]);
    }
}
