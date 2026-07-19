<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Address */
class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'full_address' => $this->full_address,
            'city' => $this->city,
            'zip_code' => $this->zip_code,
            'is_default' => $this->is_default,
        ];
    }
}
