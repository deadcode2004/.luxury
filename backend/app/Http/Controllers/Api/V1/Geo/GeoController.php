<?php

namespace App\Http\Controllers\Api\V1\Geo;

use App\Http\Controllers\Controller;
use App\Services\GeoService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeoController extends Controller
{
    public function __construct(private readonly GeoService $geo) {}

    public function countries(Request $request): JsonResponse
    {
        $data = $this->geo->countries(
            $request->query('q'),
            (int) $request->query('limit', 300)
        );

        return ApiResponse::success($data);
    }

    public function states(Request $request, int $country): JsonResponse
    {
        abort_if(! $this->geo->country($country), 404, 'Country not found');

        $data = $this->geo->states(
            $country,
            $request->query('q'),
            (int) $request->query('limit', 500)
        );

        return ApiResponse::success($data);
    }

    public function cities(Request $request, int $state): JsonResponse
    {
        abort_if(! $this->geo->state($state), 404, 'State not found');

        $data = $this->geo->cities(
            $state,
            $request->query('q'),
            (int) $request->query('limit', 200)
        );

        return ApiResponse::success($data);
    }
}
