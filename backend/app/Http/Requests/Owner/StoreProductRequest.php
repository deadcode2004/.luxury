<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isOwner() ?? false;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:products,code'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'array'],
            'name.ar' => ['required', 'string', 'max:255'],
            'name.en' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'array'],
            'brand.ar' => ['required', 'string', 'max:255'],
            'brand.en' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'ingredients' => ['nullable', 'array'],
            'usage' => ['nullable', 'array'],
            'price' => ['required', 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'image' => ['required', 'string', 'max:500'],
            'gallery' => ['nullable', 'array'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_new' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_best_seller' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
