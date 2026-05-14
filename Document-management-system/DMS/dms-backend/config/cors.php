<?php

$frontendUrl = env('FRONTEND_URL');

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8061',
        'http://127.0.0.1:8061',
        $frontendUrl,
    ])),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Content-Disposition'],
    'max_age' => 0,
    'supports_credentials' => false,
];
