<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->products->list($request->all());

        return ApiResponse::paginated(
            ProductResource::collection($paginator)
        );
    }

    public function show(string $product): JsonResponse
    {
        $model = $this->products->findByIdOrCode($product);

        return ApiResponse::success([
            'product' => ProductResource::make($model),
            'related' => ProductResource::collection($this->products->related($model)),
        ]);
    }
}
