<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOwner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isOwner()) {
            return ApiResponse::error('Owner access required.', 403, null, 'OWNER_REQUIRED');
        }

        return $next($request);
    }
}
