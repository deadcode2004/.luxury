<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\Product;
use App\Models\State;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutStockTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{country: Country, state: State, city: City}
     */
    private function seedGeo(string $iso2, string $en, string $ar, string $cityEn = 'Capital', string $cityAr = 'العاصمة'): array
    {
        $country = Country::query()->create([
            'iso2' => $iso2,
            'name_en' => $en,
            'name_ar' => $ar,
            'phonecode' => $iso2 === 'SA' ? '966' : '20',
            'flag' => $iso2 === 'SA' ? '🇸🇦' : '🇪🇬',
            'is_active' => true,
        ]);
        $state = State::query()->create([
            'country_id' => $country->id,
            'code' => '01',
            'name_en' => $en.' State',
            'name_ar' => $ar.' - محافظة',
            'is_active' => true,
        ]);
        $city = City::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'name_en' => $cityEn,
            'name_ar' => $cityAr,
            'is_active' => true,
        ]);

        return compact('country', 'state', 'city');
    }

    public function test_checkout_decrements_stock_and_clears_cart(): void
    {
        $geo = $this->seedGeo('SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Riyadh', 'الرياض');
        $user = User::factory()->create(['role' => UserRole::User]);
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 10,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 3);

        $response = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Ahmed',
            'last_name' => 'Mohammad',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'shipping_address' => [
                'full_address' => 'Olaya St',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
            ],
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertSame(7, $product->fresh()->stock);
        $this->assertDatabaseCount('cart_items', 0);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertSame($geo['city']->id, data_get($response->json('data.shipping_address'), 'city_id'));
    }

    public function test_checkout_fails_when_stock_insufficient(): void
    {
        $geo = $this->seedGeo('SA', 'Saudi Arabia', 'المملكة العربية السعودية', 'Riyadh', 'الرياض');
        $user = User::factory()->create(['role' => UserRole::User]);
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 2,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 2);

        // Simulate stock change after cart was filled.
        $product->update(['stock' => 1]);

        $this->postJson('/api/v1/checkout', [
            'payment_method' => 'cod',
            'first_name' => 'Ahmed',
            'last_name' => 'Mohammad',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'shipping_address' => [
                'full_address' => 'Olaya St',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
            ],
        ])->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_STOCK');

        $this->assertSame(1, $product->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_guest_checkout_creates_order_without_user(): void
    {
        $geo = $this->seedGeo('EG', 'Egypt', 'مصر', 'Cairo', 'القاهرة');
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Guest',
            'last_name' => 'Buyer',
            'phone' => '+201001234567',
            'email' => 'guest@example.com',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'shipping_address' => [
                'full_address' => 'Nile St',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
            ],
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', [
            'user_id' => null,
        ]);
        $this->assertTrue((bool) data_get($response->json('data.billing_snapshot'), 'is_guest'));
    }
}
