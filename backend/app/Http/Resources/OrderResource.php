<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status?->value,
            'payment_method' => $this->payment_method?->value,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'shipping' => (float) $this->shipping,
            'cod_fee' => (float) $this->cod_fee,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'shipping_address' => $this->shipping_address,
            'billing_snapshot' => $this->billing_snapshot,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'customer' => UserResource::make($this->whenLoaded('user')),
            'items_count' => $this->whenLoaded('items', fn () => $this->items->sum('quantity')),
            'placed_at' => $this->placed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
