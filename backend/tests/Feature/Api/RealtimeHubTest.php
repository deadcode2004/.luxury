<?php

namespace Tests\Feature\Api;

use App\Services\Realtime\RealtimeHub;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RealtimeHubTest extends TestCase
{
    use RefreshDatabase;

    public function test_versions_endpoint_returns_all_domains(): void
    {
        $response = $this->getJson('/api/v1/realtime/versions');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'cursor',
                    'versions' => [
                        'products',
                        'categories',
                        'coupons',
                        'orders',
                        'customers',
                        'cms',
                        'dashboard',
                    ],
                ],
            ]);
    }

    public function test_publish_bumps_domain_and_related_versions(): void
    {
        /** @var RealtimeHub $hub */
        $hub = $this->app->make(RealtimeHub::class);

        $before = $hub->versions();
        $hub->productsChanged('updated', ['id' => 1]);
        $after = $hub->versions();

        $this->assertSame($before['products'] + 1, $after['products']);
        $this->assertSame($before['dashboard'] + 1, $after['dashboard']);
        $this->assertGreaterThanOrEqual(2, $hub->cursor());

        $feed = $this->getJson('/api/v1/realtime/feed?since=0');
        $feed->assertOk();
        $events = $feed->json('data.events');
        $this->assertNotEmpty($events);
        $this->assertTrue(collect($events)->contains(fn ($e) => ($e['domain'] ?? '') === 'products'));
    }

    public function test_public_feed_hides_owner_only_domains(): void
    {
        /** @var RealtimeHub $hub */
        $hub = $this->app->make(RealtimeHub::class);
        $hub->couponsChanged('created', ['id' => 9]);
        $hub->cmsChanged('updated');

        $feed = $this->getJson('/api/v1/realtime/feed?since=0');
        $feed->assertOk();
        $domains = collect($feed->json('data.events'))->pluck('domain')->unique()->values()->all();

        $this->assertContains('cms', $domains);
        $this->assertNotContains('coupons', $domains);
    }

    public function test_sequential_publishes_never_drop_version_bumps(): void
    {
        /** @var RealtimeHub $hub */
        $hub = $this->app->make(RealtimeHub::class);

        $before = $hub->versions()['products'];
        $hub->publish(RealtimeHub::DOMAIN_PRODUCTS, 'a');
        $hub->publish(RealtimeHub::DOMAIN_PRODUCTS, 'b');
        $hub->publish(RealtimeHub::DOMAIN_PRODUCTS, 'c');

        $this->assertSame($before + 3, $hub->versions()['products']);
    }
}
