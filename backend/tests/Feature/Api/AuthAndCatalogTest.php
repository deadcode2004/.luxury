<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_and_owner_guard(): void
    {
        $register = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Sara',
            'last_name' => 'Ali',
            'email' => 'sara@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $this->assertNotEmpty($register->json('data.token'));

        $owner = User::factory()->create([
            'email' => 'owner@paradise.test',
            'role' => UserRole::Owner,
            'password' => 'password',
        ]);

        Sanctum::actingAs($owner);
        $this->getJson('/api/v1/owner/dashboard')->assertOk();

        $user = User::factory()->create(['role' => UserRole::User]);
        Sanctum::actingAs($user);
        $this->getJson('/api/v1/owner/dashboard')
            ->assertStatus(403)
            ->assertJsonPath('code', 'OWNER_REQUIRED');
    }

    public function test_products_endpoint_returns_active_catalog(): void
    {
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);

        Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 1250,
            'image' => '/images/products/paradisecare-home02.jpg',
            'stock' => 10,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.code', 'p1');
    }
}
