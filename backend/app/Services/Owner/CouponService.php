<?php

namespace App\Services\Owner;

use App\Models\Coupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CouponService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Coupon::query();

        if (! empty($filters['search'])) {
            $query->where('code', 'like', '%'.$filters['search'].'%');
        }

        return $query->latest('id')->paginate(min((int) ($filters['per_page'] ?? 15), 50));
    }

    public function create(array $data): Coupon
    {
        return Coupon::query()->create($data);
    }

    public function update(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);

        return $coupon->fresh();
    }

    public function delete(Coupon $coupon): void
    {
        $coupon->delete();
    }
}
