<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
            'folder' => ['nullable', 'string', 'in:products,cms,categories'],
        ]);

        $folder = $request->input('folder', 'products');
        $file = $request->file('file');
        $name = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("uploads/{$folder}", $name, 'public');

        return ApiResponse::created([
            'url' => '/storage/'.$path,
            'path' => $path,
        ]);
    }
}
