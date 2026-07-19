<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartStockTest extends TestCase
{
    use RefreshDatabase;

    private function seedProduct(int $stock = 8): Product
    {
        $category = Category::query()->create([
            'code' => 'c-test',
            'name' => ['ar' => 'اختبار', 'en' => 'Test'],
            'image' => '/images/test.jpg',
            'is_active' => true,
        ]);

        return Product::query()->create([
            'code' => 'p-stock',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'علامة', 'en' => 'Brand'],
            'price' => 100,
            'image' => '/images/test.jpg',
            'stock' => $stock,
            'is_active' => true,
        ]);
    }

    public function test_cannot_add_more_than_available_stock(): void
    {
        $user = User::factory()->create(['role' => UserRole::User]);
        $product = $this->seedProduct(8);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 8,
        ])->assertOk();

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_STOCK');
    }

    public function test_update_cart_rejects_quantity_above_stock(): void
    {
        $user = User::factory()->create(['role' => UserRole::User]);
        $product = $this->seedProduct(5);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk();

        $this->patchJson('/api/v1/cart/items/'.$product->id, [
            'quantity' => 6,
        ])->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_STOCK');
    }
}
