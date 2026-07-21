<?php

$configured = array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
));

$defaults = array_filter([
    env('FRONTEND_URL', 'http://localhost:3000'),
    'http://127.0.0.1:3000',
    'http://localhost:3000',
]);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique([...$defaults, ...$configured])),
    'allowed_origins_patterns' => array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGIN_PATTERNS', ''))
    )),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
