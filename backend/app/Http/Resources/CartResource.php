<?php

namespace App\Http\Resources;

use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Cart */
class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $totals = app(CartService::class)->summarize($this->resource);

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->whenLoaded('items', fn () => $this->items->sum('quantity')),
            'totals' => $totals,
        ];
    }
}
