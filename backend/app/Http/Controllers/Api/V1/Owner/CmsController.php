<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Services\CmsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CmsController extends Controller
{
    public function __construct(private readonly CmsService $cms) {}

    public function show(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        return ApiResponse::success($this->cms->getStorefront());
    }

    public function update(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        $validated = $request->validate([
            'hero' => ['sometimes', 'array'],
            'hero.slides' => ['sometimes', 'array', 'max:10'],
            'hero.slides.*.id' => ['nullable', 'string', 'max:64'],
            'hero.slides.*.image' => ['nullable', 'string', 'max:500'],
            'hero.slides.*.heading' => ['sometimes', 'array'],
            'hero.slides.*.heading.ar' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.heading.en' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.subtitle' => ['sometimes', 'array'],
            'hero.slides.*.subtitle.ar' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.subtitle.en' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.description' => ['sometimes', 'array'],
            'hero.slides.*.description.ar' => ['nullable', 'string'],
            'hero.slides.*.description.en' => ['nullable', 'string'],
            'hero.slides.*.cta' => ['sometimes', 'array'],
            'hero.slides.*.cta.ar' => ['nullable', 'string', 'max:100'],
            'hero.slides.*.cta.en' => ['nullable', 'string', 'max:100'],
            'hero.slides.*.action' => ['sometimes', 'array'],
            'hero.slides.*.action.type' => [
                'nullable',
                'string',
                Rule::in(['shop_all', 'shop_new', 'shop_offers', 'shop_discounts', 'shop_featured', 'custom']),
            ],
            'hero.slides.*.action.href' => ['nullable', 'string', 'max:500'],
            'announcement' => ['sometimes', 'array'],
            'announcement.enabled' => ['sometimes', 'boolean'],
            'announcement.text' => ['sometimes', 'array'],
            'announcement.text.ar' => ['nullable', 'string', 'max:255'],
            'announcement.text.en' => ['nullable', 'string', 'max:255'],
            'social' => ['sometimes', 'array'],
            'social.twitter' => ['sometimes', 'array'],
            'social.twitter.enabled' => ['sometimes', 'boolean'],
            'social.twitter.value' => ['nullable', 'string', 'max:500'],
            'social.instagram' => ['sometimes', 'array'],
            'social.instagram.enabled' => ['sometimes', 'boolean'],
            'social.instagram.value' => ['nullable', 'string', 'max:500'],
            'social.facebook' => ['sometimes', 'array'],
            'social.facebook.enabled' => ['sometimes', 'boolean'],
            'social.facebook.value' => ['nullable', 'string', 'max:500'],
            'social.whatsapp' => ['sometimes', 'array'],
            'social.whatsapp.enabled' => ['sometimes', 'boolean'],
            'social.whatsapp.value' => ['nullable', 'string', 'max:50'],
            'social.tiktok' => ['sometimes', 'array'],
            'social.tiktok.enabled' => ['sometimes', 'boolean'],
            'social.tiktok.value' => ['nullable', 'string', 'max:500'],
            'social.linkedin' => ['sometimes', 'array'],
            'social.linkedin.enabled' => ['sometimes', 'boolean'],
            'social.linkedin.value' => ['nullable', 'string', 'max:500'],
            'contact' => ['sometimes', 'array'],
            'contact.address' => ['sometimes', 'array'],
            'contact.address.enabled' => ['sometimes', 'boolean'],
            'contact.address.text' => ['sometimes', 'array'],
            'contact.address.text.ar' => ['nullable', 'string', 'max:500'],
            'contact.address.text.en' => ['nullable', 'string', 'max:500'],
            'contact.phones' => ['sometimes', 'array'],
            'contact.phones.enabled' => ['sometimes', 'boolean'],
            'contact.phones.numbers' => ['sometimes', 'array', 'max:10'],
            'contact.phones.numbers.*' => ['nullable', 'string', 'max:50'],
            'contact.email' => ['sometimes', 'array'],
            'contact.email.enabled' => ['sometimes', 'boolean'],
            'contact.email.value' => ['nullable', 'string', 'max:255'],
            'contact.hours' => ['sometimes', 'array'],
            'contact.hours.enabled' => ['sometimes', 'boolean'],
            'contact.hours.text' => ['sometimes', 'array'],
            'contact.hours.text.ar' => ['nullable', 'string', 'max:500'],
            'contact.hours.text.en' => ['nullable', 'string', 'max:500'],
            'contact.map' => ['sometimes', 'array'],
            'contact.map.enabled' => ['sometimes', 'boolean'],
            'contact.map.embedUrl' => ['nullable', 'string', 'max:2000'],
        ]);

        return ApiResponse::success(
            $this->cms->updateStorefront($validated),
            'CMS updated'
        );
    }
}
