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
        ]);

        return ApiResponse::success(
            $this->cms->updateStorefront($validated),
            'CMS updated'
        );
    }
}
