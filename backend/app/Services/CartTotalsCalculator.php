<?php

namespace App\Services;

use App\Enums\PaymentMethod;

class CartTotalsCalculator
{
    public const VAT_RATE = 0.15;

    public const COD_FEE = 15.0;

    /**
     * @param  iterable<array{price: float|int|string, quantity: int}>  $lines
     * @return array{subtotal: float, tax: float, shipping: float, cod_fee: float, discount: float, total: float, vat_rate: float}
     */
    public function calculate(
        iterable $lines,
        PaymentMethod $paymentMethod = PaymentMethod::Card,
        float $discount = 0
    ): array {
        $subtotal = 0.0;

        foreach ($lines as $line) {
            $subtotal += ((float) $line['price']) * ((int) $line['quantity']);
        }

        $tax = round($subtotal * self::VAT_RATE, 2);
        $shipping = 0.0;
        $codFee = $paymentMethod === PaymentMethod::Cod ? self::COD_FEE : 0.0;
        $discount = max(0, $discount);
        $total = round(max(0, $subtotal + $tax + $shipping + $codFee - $discount), 2);

        return [
            'subtotal' => round($subtotal, 2),
            'tax' => $tax,
            'shipping' => $shipping,
            'cod_fee' => $codFee,
            'discount' => round($discount, 2),
            'total' => $total,
            'vat_rate' => self::VAT_RATE,
        ];
    }
}
