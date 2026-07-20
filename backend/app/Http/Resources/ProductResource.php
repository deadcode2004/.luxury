<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'category_id' => $this->category_id,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'name' => $this->name,
            'brand' => $this->brand,
            'description' => $this->description,
            'ingredients' => $this->ingredients,
            'usage' => $this->usage,
            'price' => (float) $this->price,
            'old_price' => $this->old_price !== null ? (float) $this->old_price : null,
            'image' => $this->image,
            'gallery' => $this->gallery ?? [],
            'stock' => $this->stock,
            'inventory_status' => $this->inventoryStatus(),
            'rating' => (float) $this->rating,
            'reviews' => $this->reviews_count,
            'is_new' => $this->is_new,
            'is_featured' => $this->is_featured,
            'is_best_seller' => $this->is_best_seller,
            'is_active' => $this->is_active,
        ];
    }
}
