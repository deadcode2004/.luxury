<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\ResolveCategoryRequest;
use App\Http\Requests\Owner\StoreCategoryRequest;
use App\Http\Requests\Owner\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Owner\OwnerCategoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(private readonly OwnerCategoryService $categories) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        return ApiResponse::success(
            CategoryResource::collection($this->categories->list())
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categories->create($request->validated());

        return ApiResponse::created(CategoryResource::make($category));
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categories->update($category, $request->validated());

        return ApiResponse::success(CategoryResource::make($category), 'Category updated');
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        if ($category->products()->exists()) {
            return ApiResponse::error(
                'Cannot delete a category that still has products.',
                422,
                null,
                'CATEGORY_HAS_PRODUCTS'
            );
        }

        $this->categories->delete($category);

        return ApiResponse::success(null, 'Category deleted');
    }

    public function resolve(ResolveCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $category = $this->categories->resolveByArabicName(
            $data['name']['ar'],
            $data['image'] ?? null
        );

        return ApiResponse::success(CategoryResource::make($category));
    }
}
