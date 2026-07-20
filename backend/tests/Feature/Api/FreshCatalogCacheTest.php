<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\Owner\InventoryService;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FreshCatalogCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_product_list_reflects_admin_edit_immediately(): void
    {
        // Seed a legacy cache entry that would previously shadow fresh DB rows.
        Cache::forever('products:list:version', 'stale-version');
        Cache::put('products:list:vstale-version:'.md5(json_encode([[], 50, 1])), 'poison', 300);

        $category = Category::query()->create([
            'code' => 'c-fresh',
            'name' => ['ar' => 'قسم', 'en' => 'Cat'],
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'code' => 'fresh-1',
            'category_id' => $category->id,
            'name' => ['ar' => 'قديم', 'en' => 'Old'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/images/products/paradisecare-home02.jpg',
            'stock' => 5,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $before = $this->getJson('/api/v1/products?per_page=50')->assertOk();
        $this->assertSame('قديم', $before->json('data.0.name.ar'));
        $cacheControl = strtolower((string) $before->headers->get('Cache-Control'));
        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('no-cache', $cacheControl);

        $owner = User::factory()->create(['role' => UserRole::Owner]);
        Sanctum::actingAs($owner);

        /** @var InventoryService $inventory */
        $inventory = $this->app->make(InventoryService::class);
        $inventory->update($product, [
            'name' => ['ar' => 'جديد من لوحة التحكم'],
            'brand' => ['ar' => 'ب'],
            'price' => 150,
            'image' => $product->image,
            'stock' => 5,
            'category_id' => $category->id,
            'is_active' => true,
        ]);

        // Second visitor / other browser — must see DB truth immediately (no Redis list cache).
        $after = $this->getJson('/api/v1/products?per_page=50')->assertOk();
        $this->assertSame('جديد من لوحة التحكم', $after->json('data.0.name.ar'));
        $this->assertEquals(150, (float) $after->json('data.0.price'));
    }

    public function test_category_list_is_not_hour_cached(): void
    {
        Cache::put('categories:active', collect([['poison' => true]]), 3600);

        Category::query()->create([
            'code' => 'live-cat',
            'name' => ['ar' => 'حي', 'en' => 'Live'],
            'is_active' => true,
        ]);

        /** @var ProductService $unused */
        $unused = $this->app->make(ProductService::class);
        unset($unused);

        $response = $this->getJson('/api/v1/categories')->assertOk();
        $this->assertSame('live-cat', $response->json('data.0.code'));
        $this->assertSame('حي', $response->json('data.0.name.ar'));
    }
}
