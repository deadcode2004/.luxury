<?php

namespace App\Services\Owner;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\UserNameLocaleService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    public function __construct(private readonly UserNameLocaleService $names) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->where('role', UserRole::User)
            ->withCount('orders')
            ->withSum('orders as spent', 'total');

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('phone', 'like', $search);
            });
        }

        $page = $query->latest('id')->paginate(min((int) ($filters['per_page'] ?? 15), 50));

        // Backfill bilingual names once so admin English UI can show translated customer names.
        $page->setCollection(
            $page->getCollection()->map(fn (User $user) => $this->names->ensureLocales($user))
        );

        return $page;
    }

    public function dashboardStats(): array
    {
        $totalCustomers = (int) User::query()->where('role', UserRole::User)->count();
        $customersWithOrders = (int) User::query()
            ->where('role', UserRole::User)
            ->whereHas('orders')
            ->count();

        $conversion = $totalCustomers > 0
            ? round(($customersWithOrders / $totalCustomers) * 100, 1)
            : 0.0;

        $lowStock = (int) DB::table('products')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->where('stock', '<=', 15)
            ->count();

        $outOfStock = (int) DB::table('products')
            ->where('is_active', true)
            ->where('stock', '<=', 0)
            ->count();

        $productCount = (int) DB::table('products')->where('is_active', true)->count();

        return [
            'total_sales' => (float) DB::table('orders')->sum('total'),
            'active_orders' => (int) DB::table('orders')->whereIn('status', ['pending', 'processing'])->count(),
            'total_customers' => $totalCustomers,
            'conversion_rate' => $conversion,
            'products_count' => $productCount,
            'low_stock_count' => $lowStock,
            'out_of_stock_count' => $outOfStock,
        ];
    }
}
