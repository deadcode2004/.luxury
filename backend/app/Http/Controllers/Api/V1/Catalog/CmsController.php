<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Services\CmsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CmsController extends Controller
{
    public function __construct(private readonly CmsService $cms) {}

    public function show(): JsonResponse
    {
        return ApiResponse::success($this->cms->getStorefront());
    }
}
