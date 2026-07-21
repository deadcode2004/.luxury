<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Production API responses must never be treated as a shared/fresh HTTP cache.
 * Aligns with Next.js `/api/*` proxy headers (`private, no-store`).
 */
class PreventApiResponseCaching
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set(
            'Cache-Control',
            'private, no-store, no-cache, must-revalidate, max-age=0'
        );
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');
        $response->headers->set('Vary', 'Authorization, Cookie, Accept');
        $response->headers->remove('ETag');

        return $response;
    }
}
