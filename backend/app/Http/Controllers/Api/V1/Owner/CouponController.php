<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreCouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\Owner\CouponService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private readonly CouponService $coupons) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        return ApiResponse::paginated(
            CouponResource::collection($this->coupons->list($request->all()))
        );
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = $this->coupons->create($request->validated());

        return ApiResponse::created(CouponResource::make($coupon));
    }

    public function destroy(Request $request, Coupon $coupon): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);
        $this->coupons->delete($coupon);

        return ApiResponse::success(null, 'Coupon deleted');
    }
}
