<?php

namespace App\Services\Owner;

use App\Models\Coupon;
use App\Services\Realtime\RealtimeHub;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CouponService
{
    public function __construct(private readonly RealtimeHub $realtime) {}

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
        $coupon = Coupon::query()->create($data);
        $this->realtime->couponsChanged('created', ['id' => $coupon->id, 'code' => $coupon->code]);

        return $coupon;
    }

    public function update(Coupon $coupon, array $data): Coupon
    {
        $coupon->update($data);
        $this->realtime->couponsChanged('updated', ['id' => $coupon->id, 'code' => $coupon->code]);

        return $coupon->fresh();
    }

    public function delete(Coupon $coupon): void
    {
        $id = $coupon->id;
        $code = $coupon->code;
        $coupon->delete();
        $this->realtime->couponsChanged('deleted', ['id' => $id, 'code' => $code]);
    }
}
