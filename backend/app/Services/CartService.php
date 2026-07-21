<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function __construct(
        private readonly CartTotalsCalculator $totals
    ) {}

    public function getOrCreateCart(User $user): Cart
    {
        return Cart::query()->firstOrCreate(['user_id' => $user->id]);
    }

    public function getCart(User $user): Cart
    {
        $cart = $this->getOrCreateCart($user);
        $cart->load(['items.product.category']);

        return $cart;
    }

    public function addItem(User $user, int $productId, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $productId, $quantity) {
            $cart = $this->getOrCreateCart($user);

            /** @var Product $product */
            $product = Product::query()->whereKey($productId)->lockForUpdate()->firstOrFail();

            if (! $product->is_active) {
                throw new InsufficientStockException('Product is unavailable.', 0);
            }

            /** @var CartItem|null $item */
            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $newQty = ($item?->quantity ?? 0) + $quantity;

            if ($newQty > $product->stock) {
                throw new InsufficientStockException(
                    message: "Only {$product->stock} units available in stock.",
                    available: $product->stock
                );
            }

            if ($item) {
                $item->update(['quantity' => $newQty]);
            } else {
                CartItem::query()->create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                ]);
            }

            return $this->getCart($user);
        });
    }

    public function updateItem(User $user, int $productId, int $quantity): Cart
    {
        return DB::transaction(function () use ($user, $productId, $quantity) {
            $cart = $this->getOrCreateCart($user);

            /** @var Product $product */
            $product = Product::query()->whereKey($productId)->lockForUpdate()->firstOrFail();

            /** @var CartItem $item */
            $item = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($quantity <= 0) {
                $item->delete();

                return $this->getCart($user);
            }

            if ($quantity > $product->stock) {
                throw new InsufficientStockException(
                    message: "Only {$product->stock} units available in stock.",
                    available: $product->stock
                );
            }

            $item->update(['quantity' => $quantity]);

            return $this->getCart($user);
        });
    }

    public function removeItem(User $user, int $productId): Cart
    {
        $cart = $this->getOrCreateCart($user);
        CartItem::query()
            ->where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->delete();

        return $this->getCart($user);
    }

    public function clear(User $user): void
    {
        $cart = $this->getOrCreateCart($user);
        $cart->items()->delete();
    }

    /**
     * @return array{subtotal: float, tax: float, shipping: float, cod_fee: float, discount: float, total: float, vat_rate: float}
     */
    public function summarize(Cart $cart): array
    {
        $lines = $cart->items->map(fn (CartItem $item) => [
            'price' => $item->product->price,
            'quantity' => $item->quantity,
        ]);

        return $this->totals->calculate($lines);
    }

    public function assertStockAvailable(Cart $cart): void
    {
        foreach ($cart->items as $item) {
            /** @var Product $product */
            $product = Product::query()->whereKey($item->product_id)->lockForUpdate()->firstOrFail();

            if ($item->quantity > $product->stock) {
                throw new InsufficientStockException(
                    message: "Product {$product->code} has only {$product->stock} units left.",
                    available: $product->stock
                );
            }
        }
    }
}
