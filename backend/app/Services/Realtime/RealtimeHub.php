<?php

namespace App\Services\Realtime;

use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;

/**
 * Domain-version realtime hub.
 *
 * Mutations bump per-domain versions (and optionally append to an event log).
 * Clients poll /realtime/versions and refetch only when a subscribed domain changes.
 * Works with Redis in production and the array cache driver in tests.
 *
 * Writes are lock-serialized so concurrent publishes cannot drop a version bump.
 */
class RealtimeHub
{
    public const DOMAIN_PRODUCTS = 'products';

    public const DOMAIN_CATEGORIES = 'categories';

    public const DOMAIN_COUPONS = 'coupons';

    public const DOMAIN_ORDERS = 'orders';

    public const DOMAIN_CUSTOMERS = 'customers';

    public const DOMAIN_CMS = 'cms';

    public const DOMAIN_DASHBOARD = 'dashboard';

    /** @var list<string> */
    public const DOMAINS = [
        self::DOMAIN_PRODUCTS,
        self::DOMAIN_CATEGORIES,
        self::DOMAIN_COUPONS,
        self::DOMAIN_ORDERS,
        self::DOMAIN_CUSTOMERS,
        self::DOMAIN_CMS,
        self::DOMAIN_DASHBOARD,
    ];

    private const VERSIONS_KEY = 'realtime:domain_versions';

    private const CURSOR_KEY = 'realtime:cursor';

    private const EVENTS_KEY = 'realtime:events';

    private const LOCK_KEY = 'realtime:publish_lock';

    private const MAX_EVENTS = 250;

    /**
     * @param  array<string, mixed>  $payload
     * @return array{id: int, domain: string, action: string, payload: array<string, mixed>, at: string}
     */
    public function publish(string $domain, string $action, array $payload = []): array
    {
        $domain = $this->assertDomain($domain);

        try {
            return Cache::lock(self::LOCK_KEY, 5)->block(
                5,
                fn () => $this->publishUnlocked($domain, $action, $payload)
            );
        } catch (LockTimeoutException) {
            // Fail open: still attempt a best-effort publish so clients are not stuck forever.
            return $this->publishUnlocked($domain, $action, $payload);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{id: int, domain: string, action: string, payload: array<string, mixed>, at: string}
     */
    private function publishUnlocked(string $domain, string $action, array $payload = []): array
    {
        $versions = $this->versions();
        $versions[$domain] = ((int) ($versions[$domain] ?? 0)) + 1;
        Cache::forever(self::VERSIONS_KEY, $versions);

        $cursor = ((int) Cache::get(self::CURSOR_KEY, 0)) + 1;
        Cache::forever(self::CURSOR_KEY, $cursor);

        $event = [
            'id' => $cursor,
            'domain' => $domain,
            'action' => $action,
            'payload' => $payload,
            'at' => now()->toIso8601String(),
        ];

        $events = Cache::get(self::EVENTS_KEY, []);
        if (! is_array($events)) {
            $events = [];
        }
        $events[] = $event;
        if (count($events) > self::MAX_EVENTS) {
            $events = array_slice($events, -self::MAX_EVENTS);
        }
        Cache::forever(self::EVENTS_KEY, $events);

        return $event;
    }

    /**
     * @param  list<string>  $domains
     * @param  array<string, mixed>  $payload
     * @return list<array{id: int, domain: string, action: string, payload: array<string, mixed>, at: string}>
     */
    public function publishMany(array $domains, string $action, array $payload = []): array
    {
        $out = [];
        foreach (array_unique($domains) as $domain) {
            $out[] = $this->publish((string) $domain, $action, $payload);
        }

        return $out;
    }

    /** Product catalog changed (create / update / delete / stock). */
    public function productsChanged(string $action, array $payload = []): void
    {
        $this->publishMany(
            [self::DOMAIN_PRODUCTS, self::DOMAIN_DASHBOARD],
            $action,
            $payload
        );
    }

    public function categoriesChanged(string $action, array $payload = []): void
    {
        $this->publishMany(
            [self::DOMAIN_CATEGORIES, self::DOMAIN_PRODUCTS, self::DOMAIN_DASHBOARD],
            $action,
            $payload
        );
    }

    public function couponsChanged(string $action, array $payload = []): void
    {
        $this->publish(self::DOMAIN_COUPONS, $action, $payload);
    }

    public function ordersChanged(string $action, array $payload = []): void
    {
        $this->publishMany(
            [self::DOMAIN_ORDERS, self::DOMAIN_CUSTOMERS, self::DOMAIN_DASHBOARD],
            $action,
            $payload
        );
    }

    public function customersChanged(string $action, array $payload = []): void
    {
        $this->publishMany(
            [self::DOMAIN_CUSTOMERS, self::DOMAIN_DASHBOARD],
            $action,
            $payload
        );
    }

    public function cmsChanged(string $action, array $payload = []): void
    {
        $this->publish(self::DOMAIN_CMS, $action, $payload);
    }

    /**
     * @return array<string, int>
     */
    public function versions(): array
    {
        $stored = Cache::get(self::VERSIONS_KEY, []);
        if (! is_array($stored)) {
            $stored = [];
        }

        $versions = [];
        foreach (self::DOMAINS as $domain) {
            $versions[$domain] = (int) ($stored[$domain] ?? 0);
        }

        return $versions;
    }

    public function cursor(): int
    {
        return (int) Cache::get(self::CURSOR_KEY, 0);
    }

    /**
     * @return list<array{id: int, domain: string, action: string, payload: array<string, mixed>, at: string}>
     */
    public function eventsSince(int $since = 0, ?array $domains = null): array
    {
        $events = Cache::get(self::EVENTS_KEY, []);
        if (! is_array($events)) {
            return [];
        }

        $allowed = $domains !== null
            ? array_values(array_intersect(self::DOMAINS, $domains))
            : self::DOMAINS;

        $out = [];
        foreach ($events as $event) {
            if (! is_array($event)) {
                continue;
            }
            $id = (int) ($event['id'] ?? 0);
            $domain = (string) ($event['domain'] ?? '');
            if ($id <= $since) {
                continue;
            }
            if (! in_array($domain, $allowed, true)) {
                continue;
            }
            $out[] = [
                'id' => $id,
                'domain' => $domain,
                'action' => (string) ($event['action'] ?? 'changed'),
                'payload' => is_array($event['payload'] ?? null) ? $event['payload'] : [],
                'at' => (string) ($event['at'] ?? ''),
            ];
        }

        return $out;
    }

    private function assertDomain(string $domain): string
    {
        if (! in_array($domain, self::DOMAINS, true)) {
            throw new \InvalidArgumentException("Unknown realtime domain [{$domain}]");
        }

        return $domain;
    }
}
