<?php

namespace App\Http\Requests\Checkout;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.full_address' => ['required', 'string', 'max:500'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.zip_code' => ['nullable', 'string', 'max:20'],
            'shipping_address.country_code' => ['required', 'string', 'size:2'],
            'shipping_address.country_name' => ['nullable', 'string', 'max:120'],
            'shipping_address.state_code' => ['nullable', 'string', 'max:20'],
            'shipping_address.state_name' => ['nullable', 'string', 'max:120'],
            'shipping_address.phone_country_code' => ['nullable', 'string', 'size:2'],
            'shipping_address.phone_dial_code' => ['nullable', 'string', 'max:8'],
        ];
    }
}
