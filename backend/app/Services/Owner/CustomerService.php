<?php

namespace App\Services\Owner;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CustomerService
{
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

        return $query->latest('id')->paginate(min((int) ($filters['per_page'] ?? 15), 50));
    }

    public function dashboardStats(): array
    {
        return [
            'total_sales' => (float) DB::table('orders')->sum('total'),
            'active_orders' => (int) DB::table('orders')->whereIn('status', ['pending', 'processing'])->count(),
            'total_customers' => (int) User::query()->where('role', UserRole::User)->count(),
            'conversion_rate' => 3.2,
        ];
    }
}
