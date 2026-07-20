<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->role?->value,
            'is_active' => $this->is_active,
            'notify_orders' => (bool) $this->notify_orders,
            'notify_stock' => (bool) $this->notify_stock,
            'notify_marketing' => (bool) $this->notify_marketing,
            'orders_count' => $this->when(isset($this->orders_count), $this->orders_count),
            'spent' => $this->when(isset($this->spent), (float) $this->spent),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
