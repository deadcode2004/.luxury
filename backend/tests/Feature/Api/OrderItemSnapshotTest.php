<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\State;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderItemSnapshotTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_snapshots_product_image_and_discount_prices(): void
    {
        $country = Country::query()->create([
            'iso2' => 'EG',
            'name_en' => 'Egypt',
            'name_ar' => 'مصر',
            'phonecode' => '20',
            'flag' => '🇪🇬',
            'is_active' => true,
        ]);
        $state = State::query()->create([
            'country_id' => $country->id,
            'code' => 'C',
            'name_en' => 'Cairo',
            'name_ar' => 'القاهرة',
            'is_active' => true,
        ]);
        $city = City::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'name_en' => 'Cairo',
            'name_ar' => 'القاهرة',
            'is_active' => true,
        ]);

        $owner = User::factory()->create(['role' => UserRole::Owner]);
        $user = User::factory()->create(['role' => UserRole::User]);
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p-sale',
            'category_id' => $category->id,
            'name' => ['ar' => 'عطر', 'en' => 'Perfume'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 80,
            'old_price' => 100,
            'image' => '/storage/products/perfume.jpg',
            'stock' => 10,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 2);

        $checkout = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Sara',
            'last_name' => 'Ali',
            'phone' => '+201001234567',
            'email' => 'sara@example.com',
            'shipping_address' => [
                'full_address' => 'Nile St',
                'country_id' => $country->id,
                'state_id' => $state->id,
                'city_id' => $city->id,
            ],
        ]);

        $checkout->assertCreated();

        $item = OrderItem::query()->first();
        $this->assertNotNull($item);
        $this->assertSame('/storage/products/perfume.jpg', $item->product_image);
        $this->assertEquals(80.0, (float) $item->unit_price);
        $this->assertEquals(100.0, (float) $item->original_unit_price);
        $this->assertEquals(20.0, (float) $item->unit_discount);
        $this->assertEquals(40.0, (float) $item->line_discount);
        $this->assertEquals(160.0, (float) $item->line_total);

        // Catalog price changes must not affect the stored order snapshot.
        $product->update(['price' => 999, 'old_price' => 1200, 'image' => '/storage/products/new.jpg']);

        Sanctum::actingAs($owner);
        $this->getJson('/api/v1/owner/orders/'.$item->order_id)
            ->assertOk()
            ->assertJsonPath('data.items.0.unit_price', 80)
            ->assertJsonPath('data.items.0.original_unit_price', 100)
            ->assertJsonPath('data.items.0.line_discount', 40)
            ->assertJsonPath('data.items.0.product_image', '/storage/products/perfume.jpg')
            ->assertJsonPath('data.items.0.has_discount', true)
            ->assertJsonPath('data.items_subtotal_before_discount', 200)
            ->assertJsonPath('data.items_discount_total', 40);
    }
}
