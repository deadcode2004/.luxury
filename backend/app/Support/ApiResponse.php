<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Collection;

class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => self::transform($data),
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function created(mixed $data = null, string $message = 'Created'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function error(
        string $message,
        int $status = 400,
        mixed $errors = null,
        ?string $code = null
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($code !== null) {
            $payload['code'] = $code;
        }

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    public static function paginated(
        AbstractPaginator|ResourceCollection $paginator,
        string $message = 'OK'
    ): JsonResponse {
        if ($paginator instanceof ResourceCollection) {
            $resource = $paginator->response()->getData(true);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $resource['data'] ?? [],
                'meta' => [
                    'pagination' => [
                        'current_page' => $resource['meta']['current_page'] ?? null,
                        'last_page' => $resource['meta']['last_page'] ?? null,
                        'per_page' => $resource['meta']['per_page'] ?? null,
                        'total' => $resource['meta']['total'] ?? null,
                    ],
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => self::transform($paginator->items()),
            'meta' => [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    private static function transform(mixed $data): mixed
    {
        if ($data instanceof ResourceCollection || $data instanceof JsonResource) {
            return $data->resolve();
        }

        if ($data instanceof Collection) {
            return $data->map(fn ($item) => self::transform($item))->all();
        }

        if (is_array($data)) {
            $out = [];
            foreach ($data as $key => $value) {
                $out[$key] = self::transform($value);
            }

            return $out;
        }

        return $data;
    }
}
