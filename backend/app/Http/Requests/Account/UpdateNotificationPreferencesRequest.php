<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notify_orders' => ['sometimes', 'boolean'],
            'notify_stock' => ['sometimes', 'boolean'],
            'notify_marketing' => ['sometimes', 'boolean'],
        ];
    }
}
