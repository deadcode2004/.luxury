<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\CartItem */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'product' => ProductResource::make($this->whenLoaded('product')),
            'line_total' => $this->when(
                $this->relationLoaded('product'),
                fn () => round(((float) $this->product->price) * $this->quantity, 2)
            ),
        ];
    }
}
