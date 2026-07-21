<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use Illuminate\Support\Facades\Log;

class LogOrderPlaced
{
    public function handle(OrderPlaced $event): void
    {
        Log::info('Order placed', [
            'order_id' => $event->order->id,
            'number' => $event->order->number,
            'total' => $event->order->total,
            'user_id' => $event->order->user_id,
        ]);
    }
}
