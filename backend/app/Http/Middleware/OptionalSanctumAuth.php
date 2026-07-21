<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authenticate via Sanctum when a bearer token is present; otherwise continue as guest.
 */
class OptionalSanctumAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->bearerToken()) {
            $user = auth('sanctum')->user();
            if ($user) {
                auth()->setUser($user);
            }
        }

        return $next($request);
    }
}
