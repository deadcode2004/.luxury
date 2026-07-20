<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductReviewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_starts_with_no_reviews(): void
    {
        $product = $this->makeProduct();

        $this->getJson("/api/v1/products/{$product->id}/reviews")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);

        $this->getJson("/api/v1/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.product.rating', 0)
            ->assertJsonPath('data.product.reviews', 0);
    }

    public function test_authenticated_user_can_submit_review(): void
    {
        $this->mock(ProductTranslationService::class, function ($mock) {
            $mock->shouldReceive('bilingualFromText')
                ->once()
                ->withArgs(fn ($text) => $text === 'منتج ممتاز جداً')
                ->andReturn([
                    'ar' => 'منتج ممتاز جداً',
                    'en' => 'Excellent product',
                ]);
        });

        $product = $this->makeProduct();
        $user = User::factory()->create([
            'name' => 'Sara Ali',
            'first_name' => 'Sara',
            'last_name' => 'Ali',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'منتج ممتاز جداً',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.comment.ar', 'منتج ممتاز جداً')
            ->assertJsonPath('data.comment.en', 'Excellent product')
            ->assertJsonPath('data.author.ar', 'Sara Ali');

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => 5,
        ]);

        $product->refresh();
        $this->assertSame(1, $product->reviews_count);
        $this->assertEquals(5.0, (float) $product->rating);
    }

    public function test_guest_cannot_submit_review(): void
    {
        $product = $this->makeProduct();

        $this->postJson('/api/v1/reviews', [
            'product_id' => $product->id,
            'rating' => 4,
            'comment' => 'Nice',
        ])->assertUnauthorized();
    }

    public function test_bilingual_from_text_skips_retranslate_when_unchanged(): void
    {
        /** @var ProductTranslationService $service */
        $service = $this->app->make(ProductTranslationService::class);

        $previous = ['ar' => 'رائع', 'en' => 'Great'];
        $again = $service->bilingualFromText('رائع', $previous);
        $this->assertSame($previous, $again);

        $fromEn = $service->bilingualFromText('Great', $previous);
        $this->assertSame($previous, $fromEn);
    }

    public function test_detect_source_locale(): void
    {
        /** @var ProductTranslationService $service */
        $service = $this->app->make(ProductTranslationService::class);

        $this->assertSame('ar', $service->detectSourceLocale('منتج رائع جداً'));
        $this->assertSame('en', $service->detectSourceLocale('Really great product'));
        $this->assertSame('en', $service->detectSourceLocale('Sehr gutes Produkt'));
    }

    private function makeProduct(): Product
    {
        $category = Category::query()->create([
            'code' => 'cat-test',
            'name' => ['ar' => 'قسم', 'en' => 'Cat'],
            'is_active' => true,
        ]);

        return Product::query()->create([
            'code' => 'prod-rev',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'علامة', 'en' => 'Brand'],
            'price' => 100,
            'image' => '/images/products/paradisecare-home02.jpg',
            'stock' => 10,
            'rating' => 0,
            'reviews_count' => 0,
            'is_active' => true,
        ]);
    }
}
