<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /**
     * Catalog prices (`price`, `old_price`) are always stored in EGP.
     * Storefront conversion to SAR/USD is display-time only.
     */    protected $fillable = [
        'code',
        'category_id',
        'name',
        'brand',
        'description',
        'ingredients',
        'usage',
        'price',
        'old_price',
        'image',
        'gallery',
        'stock',
        'rating',
        'reviews_count',
        'is_new',
        'is_featured',
        'is_best_seller',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'brand' => 'array',
            'description' => 'array',
            'ingredients' => 'array',
            'usage' => 'array',
            'gallery' => 'array',
            'price' => 'decimal:2',
            'old_price' => 'decimal:2',
            'rating' => 'decimal:2',
            'stock' => 'integer',
            'reviews_count' => 'integer',
            'is_new' => 'boolean',
            'is_featured' => 'boolean',
            'is_best_seller' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function hasStock(int $quantity): bool
    {
        return $this->stock >= $quantity;
    }

    public function inventoryStatus(): string
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        }

        if ($this->stock <= 15) {
            return 'low_stock';
        }

        return 'active';
    }
}
