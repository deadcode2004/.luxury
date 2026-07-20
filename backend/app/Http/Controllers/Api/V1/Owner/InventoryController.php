<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\StoreProductRequest;
use App\Http\Requests\Owner\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Owner\InventoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private readonly InventoryService $inventory) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        return ApiResponse::paginated(
            ProductResource::collection($this->inventory->list($request->all()))
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);
        $product = $this->inventory->create($request->validated());

        return ApiResponse::created(ProductResource::make($product));
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);
        $product = $this->inventory->update($product, $request->validated());

        return ApiResponse::success(ProductResource::make($product), 'Product updated');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);
        $this->inventory->delete($product);

        return ApiResponse::success(null, 'Product deleted');
    }
}
