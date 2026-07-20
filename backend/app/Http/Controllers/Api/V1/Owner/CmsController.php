<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Services\CmsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'hero.heading' => ['sometimes', 'array'],
            'hero.heading.ar' => ['nullable', 'string', 'max:255'],
            'hero.heading.en' => ['nullable', 'string', 'max:255'],
            'hero.subtitle' => ['sometimes', 'array'],
            'hero.subtitle.ar' => ['nullable', 'string', 'max:255'],
            'hero.subtitle.en' => ['nullable', 'string', 'max:255'],
            'hero.description' => ['sometimes', 'array'],
            'hero.description.ar' => ['nullable', 'string'],
            'hero.description.en' => ['nullable', 'string'],
            'hero.cta' => ['sometimes', 'array'],
            'hero.cta.ar' => ['nullable', 'string', 'max:100'],
            'hero.cta.en' => ['nullable', 'string', 'max:100'],
            'hero.link' => ['nullable', 'string', 'max:255'],
            'hero.image' => ['nullable', 'string', 'max:500'],
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
