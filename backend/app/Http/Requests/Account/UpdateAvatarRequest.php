<?php

namespace App\Http\Requests\Account;

use App\Services\AvatarService;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp,gif',
                'max:'.AvatarService::MAX_KILOBYTES,
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'An image file is required.',
            'avatar.image' => 'The file must be an image.',
            'avatar.mimes' => 'Only JPEG, PNG, WebP, and GIF images are allowed.',
            'avatar.max' => 'The image may not be greater than 5 MB.',
        ];
    }
}
