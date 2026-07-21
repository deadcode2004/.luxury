<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_code',
        'product_name',
        'product_image',
        'unit_price',
        'original_unit_price',
        'unit_discount',
        'quantity',
        'line_discount',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'product_name' => 'array',
            'unit_price' => 'decimal:2',
            'original_unit_price' => 'decimal:2',
            'unit_discount' => 'decimal:2',
            'line_discount' => 'decimal:2',
            'line_total' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
