<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\PostalCode;
use App\Models\Product;
use App\Models\State;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostalCheckoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{country: Country, state: State, city: City, otherCity: City}
     */
    private function seedGeoWithPostal(): array
    {
        $country = Country::query()->create([
            'iso2' => 'EG',
            'name_en' => 'Egypt',
            'name_ar' => 'مصر',
            'phonecode' => '20',
            'flag' => '🇪🇬',
            'is_active' => true,
            'postal_code_required' => true,
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
        $otherCity = City::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'name_en' => 'Giza',
            'name_ar' => 'الجيزة',
            'is_active' => true,
        ]);

        PostalCode::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'city_id' => $city->id,
            'code' => '11511',
            'place_name_en' => 'Downtown',
            'place_name_ar' => 'وسط البلد',
            'is_active' => true,
        ]);
        PostalCode::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'city_id' => $otherCity->id,
            'code' => '12511',
            'place_name_en' => 'Giza',
            'place_name_ar' => 'الجيزة',
            'is_active' => true,
        ]);

        return compact('country', 'state', 'city', 'otherCity');
    }

    private function product(): Product
    {
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);

        return Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    public function test_checkout_rejects_postal_code_not_matching_city(): void
    {
        $geo = $this->seedGeoWithPostal();
        $product = $this->product();
        $user = User::factory()->create(['role' => UserRole::User]);
        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 1);

        $this->postJson('/api/v1/checkout', [
            'payment_method' => 'cod',
            'first_name' => 'Ahmed',
            'last_name' => 'Ali',
            'phone' => '+201001234567',
            'email' => 'a@example.com',
            'shipping_address' => [
                'full_address' => 'Tahrir',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
                // Valid for Giza, not Cairo
                'zip_code' => '12511',
            ],
        ], ['X-Locale' => 'en'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'INVALID_POSTAL_CODE')
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_accepts_postal_code_for_selected_city(): void
    {
        $geo = $this->seedGeoWithPostal();
        $product = $this->product();
        $user = User::factory()->create(['role' => UserRole::User]);
        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 1);

        $response = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'cod',
            'first_name' => 'Ahmed',
            'last_name' => 'Ali',
            'phone' => '+201001234567',
            'email' => 'a@example.com',
            'shipping_address' => [
                'full_address' => 'Tahrir',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
                'zip_code' => '11511',
            ],
        ], ['X-Locale' => 'ar']);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertSame('11511', data_get($response->json('data.shipping_address'), 'zip_code'));
        $this->assertNotNull(data_get($response->json('data.shipping_address'), 'postal_code_id'));
    }

    public function test_checkout_requires_postal_when_country_flag_set(): void
    {
        $geo = $this->seedGeoWithPostal();
        $product = $this->product();

        $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Guest',
            'last_name' => 'Buyer',
            'phone' => '+201001234567',
            'email' => 'g@example.com',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'shipping_address' => [
                'full_address' => 'Nile',
                'country_id' => $geo['country']->id,
                'state_id' => $geo['state']->id,
                'city_id' => $geo['city']->id,
            ],
        ], ['Accept-Language' => 'ar'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'POSTAL_CODE_REQUIRED');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_rejects_city_outside_selected_state(): void
    {
        $geo = $this->seedGeoWithPostal();
        $otherState = State::query()->create([
            'country_id' => $geo['country']->id,
            'code' => 'ALX',
            'name_en' => 'Alexandria',
            'name_ar' => 'الإسكندرية',
            'is_active' => true,
        ]);
        $product = $this->product();

        $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Guest',
            'last_name' => 'Buyer',
            'phone' => '+201001234567',
            'email' => 'g@example.com',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'shipping_address' => [
                'full_address' => 'Nile',
                'country_id' => $geo['country']->id,
                'state_id' => $otherState->id,
                'city_id' => $geo['city']->id,
                'zip_code' => '11511',
            ],
        ])->assertStatus(422)
            ->assertJsonPath('code', 'INVALID_CITY');
    }

    public function test_postal_codes_endpoint_lists_city_codes(): void
    {
        $geo = $this->seedGeoWithPostal();

        $this->getJson('/api/v1/geo/cities/'.$geo['city']->id.'/postal-codes')
            ->assertOk()
            ->assertJsonPath('data.0.code', '11511');
    }
}
