<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ProductService;
use App\Services\ReviewService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewService $reviews,
        private readonly ProductService $products,
    ) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            ReviewResource::collection($this->reviews->listPublic())
        );
    }

    public function forProduct(string $product): JsonResponse
    {
        $model = $this->products->findByIdOrCode($product);

        return ApiResponse::success(
            ReviewResource::collection($this->reviews->listForProduct($model))
        );
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        // Optional auth: bearer token attaches the logged-in shopper when present.
        $user = Auth::guard('sanctum')->user() ?? $request->user();

        $review = $this->reviews->create(
            $user,
            $request->validated()
        );

        return ApiResponse::created(
            ReviewResource::make($review),
            'Review submitted'
        );
    }
}
