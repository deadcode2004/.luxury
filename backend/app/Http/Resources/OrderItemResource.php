<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\OrderItem */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $unitPrice = (float) $this->unit_price;
        $original = $this->original_unit_price !== null
            ? (float) $this->original_unit_price
            : null;
        $unitDiscount = (float) ($this->unit_discount ?? 0);
        $lineDiscount = (float) ($this->line_discount ?? 0);
        $hasDiscount = $original !== null && $original > $unitPrice && $unitDiscount > 0;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_code' => $this->product_code,
            'product_name' => $this->product_name,
            'product_image' => $this->product_image
                ?: ($this->relationLoaded('product') ? $this->product?->image : null),
            'unit_price' => $unitPrice,
            'original_unit_price' => $hasDiscount ? $original : null,
            'unit_discount' => $hasDiscount ? $unitDiscount : 0.0,
            'quantity' => $this->quantity,
            'line_discount' => $hasDiscount ? $lineDiscount : 0.0,
            'line_total' => (float) $this->line_total,
            'has_discount' => $hasDiscount,
        ];
    }
}
