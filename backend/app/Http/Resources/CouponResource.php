<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Coupon */
class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type?->value,
            'value' => (float) $this->value,
            'uses' => $this->uses,
            'max_uses' => $this->max_uses,
            'expires_at' => $this->expires_at?->toDateString(),
            'is_active' => $this->is_active,
            'status' => $this->statusLabel(),
        ];
    }
}
