<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->relationLoaded('items') ? $this->items : collect();

        $itemsGross = 0.0;
        $itemsDiscount = 0.0;
        foreach ($items as $item) {
            $unit = (float) $item->unit_price;
            $original = $item->original_unit_price !== null
                ? (float) $item->original_unit_price
                : $unit;
            if ($original < $unit) {
                $original = $unit;
            }
            $qty = (int) $item->quantity;
            $itemsGross += $original * $qty;
            $lineDiscount = (float) ($item->line_discount ?? 0);
            if ($lineDiscount <= 0 && $original > $unit) {
                $lineDiscount = ($original - $unit) * $qty;
            }
            $itemsDiscount += $lineDiscount;
        }

        $couponDiscount = (float) $this->discount;

        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status?->value,
            'payment_method' => $this->payment_method?->value,
            'subtotal' => (float) $this->subtotal,
            'items_subtotal_before_discount' => round($itemsGross, 2),
            'items_discount_total' => round($itemsDiscount, 2),
            'tax' => (float) $this->tax,
            'shipping' => (float) $this->shipping,
            'cod_fee' => (float) $this->cod_fee,
            'discount' => $couponDiscount,
            'coupon_discount' => $couponDiscount,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'coupon_id' => $this->coupon_id,
            'coupon' => $this->when(
                $this->relationLoaded('coupon') && $this->coupon,
                fn () => [
                    'id' => $this->coupon->id,
                    'code' => $this->coupon->code,
                    'type' => $this->coupon->type?->value,
                    'value' => (float) $this->coupon->value,
                ]
            ),
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
