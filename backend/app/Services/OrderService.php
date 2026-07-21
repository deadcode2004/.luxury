<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Events\OrderPlaced;
use App\Exceptions\DomainException;
use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Realtime\RealtimeHub;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly CartTotalsCalculator $totals,
        private readonly RealtimeHub $realtime,
        private readonly UserNameLocaleService $names,
    ) {}

    /**
     * Place an order for an authenticated user or a guest.
     *
     * @param  array{
     *   payment_method: string,
     *   shipping_address: array<string, mixed>,
     *   first_name?: string,
     *   last_name?: string,
     *   phone?: string,
     *   email?: string,
     *   items?: list<array{product_id: int, quantity: int}>
     * }  $payload
     */
    public function checkout(?User $user, array $payload): Order
    {
        return DB::transaction(function () use ($user, $payload) {
            $cartLines = $this->resolveCartLines($user, $payload);

            if ($cartLines->isEmpty()) {
                throw new DomainException('Cart is empty.', 422, 'CART_EMPTY');
            }

            $productIds = $cartLines->pluck('product_id')->all();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cartLines as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['product_id']);

                if (! $product || ! $product->is_active) {
                    throw new DomainException('One or more products are unavailable.', 422, 'PRODUCT_UNAVAILABLE');
                }

                if ($item['quantity'] > $product->stock) {
                    throw new InsufficientStockException(
                        message: "Product {$product->code} has only {$product->stock} units left.",
                        available: $product->stock
                    );
                }
            }

            $paymentMethod = PaymentMethod::from($payload['payment_method']);
            $pricedLines = $cartLines->map(fn (array $item) => [
                'price' => $products[$item['product_id']]->price,
                'quantity' => $item['quantity'],
            ]);
            $totals = $this->totals->calculate($pricedLines, $paymentMethod);

            $order = Order::query()->create([
                'number' => $this->generateOrderNumber(),
                'user_id' => $user?->id,
                'status' => OrderStatus::Pending,
                'payment_method' => $paymentMethod,
                'subtotal' => $totals['subtotal'],
                'tax' => $totals['tax'],
                'shipping' => $totals['shipping'],
                'cod_fee' => $totals['cod_fee'],
                'discount' => $totals['discount'],
                'total' => $totals['total'],
                'currency' => 'EGP',
                'shipping_address' => $payload['shipping_address'],
                'billing_snapshot' => [
                    'first_name' => $payload['first_name'] ?? $user?->first_name,
                    'last_name' => $payload['last_name'] ?? $user?->last_name,
                    'phone' => $payload['phone'] ?? $user?->phone,
                    'email' => $payload['email'] ?? $user?->email,
                    'is_guest' => $user === null,
                ],
                'placed_at' => now(),
            ]);

            foreach ($cartLines as $item) {
                $product = $products[$item['product_id']];

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_code' => $product->code,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'line_total' => round(((float) $product->price) * $item['quantity'], 2),
                ]);

                $affected = Product::query()
                    ->whereKey($product->id)
                    ->where('stock', '>=', $item['quantity'])
                    ->decrement('stock', $item['quantity']);

                if ($affected === 0) {
                    throw new InsufficientStockException(
                        message: "Product {$product->code} stock changed during checkout.",
                        available: $product->fresh()->stock
                    );
                }
            }

            if ($user) {
                $this->cartService->clear($user);
            }

            ProductService::flushListCache();

            $order->load(['items.product', 'user']);
            event(new OrderPlaced($order));

            $this->realtime->productsChanged('stock_changed', [
                'order_id' => $order->id,
                'product_ids' => $productIds,
            ]);
            $this->realtime->ordersChanged('created', [
                'id' => $order->id,
                'number' => $order->number,
            ]);

            return $order;
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return Collection<int, array{product_id: int, quantity: int}>
     */
    private function resolveCartLines(?User $user, array $payload): Collection
    {
        $items = $payload['items'] ?? null;
        if (is_array($items) && $items !== []) {
            return collect($items)
                ->map(fn ($item) => [
                    'product_id' => (int) ($item['product_id'] ?? 0),
                    'quantity' => (int) ($item['quantity'] ?? 0),
                ])
                ->filter(fn (array $item) => $item['product_id'] > 0 && $item['quantity'] > 0)
                ->values();
        }

        if (! $user) {
            return collect();
        }

        $cart = $this->cartService->getCart($user);

        return $cart->items->map(fn ($item) => [
            'product_id' => (int) $item->product_id,
            'quantity' => (int) $item->quantity,
        ])->values();
    }

    public function listForUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->latest('placed_at')
            ->paginate($perPage);
    }

    public function listAll(array $filters = []): LengthAwarePaginator
    {
        $query = Order::query()->with(['user', 'items']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', $search)
                    ->orWhere('billing_snapshot->email', 'like', $search)
                    ->orWhere('billing_snapshot->phone', 'like', $search)
                    ->orWhere('billing_snapshot->first_name', 'like', $search)
                    ->orWhere('billing_snapshot->last_name', 'like', $search)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $search)->orWhere('email', 'like', $search));
            });
        }

        $page = $query->latest('placed_at')->paginate(min((int) ($filters['per_page'] ?? 15), 50));
        $page->setCollection(
            $page->getCollection()->map(fn (Order $order) => $this->withLocalizedCustomer($order))
        );

        return $page;
    }

    public function updateStatus(Order $order, OrderStatus $status): Order
    {
        $order->update(['status' => $status]);
        $fresh = $order->fresh(['items', 'user']);
        $fresh = $this->withLocalizedCustomer($fresh);
        $this->realtime->ordersChanged('status_updated', [
            'id' => $fresh->id,
            'number' => $fresh->number,
            'status' => $fresh->status?->value,
        ]);

        return $fresh;
    }

    private function withLocalizedCustomer(Order $order): Order
    {
        if ($order->relationLoaded('user') && $order->user instanceof User) {
            $order->setRelation('user', $this->names->ensureLocales($order->user));
        }

        return $order;
    }

    private function generateOrderNumber(): string
    {
        return '#ORD-'.now()->format('ymd').'-'.strtoupper(substr(uniqid(), -5));
    }
}
