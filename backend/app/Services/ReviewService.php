<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\Realtime\RealtimeHub;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ReviewService
{
    public function __construct(
        private readonly ProductTranslationService $translator,
        private readonly RealtimeHub $realtime,
    ) {}

    public function listForProduct(Product $product, int $limit = 50): Collection
    {
        return Review::query()
            ->where('product_id', $product->id)
            ->where('is_published', true)
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    /**
     * Recent published product reviews (homepage carousel).
     */
    public function listPublic(int $limit = 20): Collection
    {
        return Review::query()
            ->where('is_published', true)
            ->whereNotNull('product_id')
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  array{product_id: int, rating: int, comment: string}  $data
     */
    public function create(User $user, array $data): Review
    {
        $product = Product::query()->whereKey($data['product_id'])->firstOrFail();
        $commentLocales = $this->translator->bilingualFromText((string) $data['comment']);
        $authorName = trim((string) ($user->name ?: $user->first_name)) ?: 'Customer';

        $review = Review::query()->create([
            'code' => 'rv-'.Str::lower(Str::random(8)),
            'product_id' => $product->id,
            'user_id' => $user->id,
            'author' => ['ar' => $authorName, 'en' => $authorName],
            'rating' => (int) $data['rating'],
            'comment' => $commentLocales,
            'is_published' => true,
        ]);

        $this->refreshProductStats($product);
        $this->realtime->productsChanged('review_created', [
            'product_id' => $product->id,
            'review_id' => $review->id,
        ]);

        return $review;
    }

    /**
     * @param  array{rating?: int, comment?: string}  $data
     */
    public function update(Review $review, array $data): Review
    {
        $payload = [];

        if (array_key_exists('rating', $data)) {
            $payload['rating'] = (int) $data['rating'];
        }

        if (array_key_exists('comment', $data)) {
            $previous = is_array($review->comment) ? $review->comment : [];
            $payload['comment'] = $this->translator->bilingualFromText(
                (string) $data['comment'],
                $previous
            );
        }

        if ($payload !== []) {
            $review->update($payload);
        }

        if ($review->product_id) {
            $product = Product::query()->find($review->product_id);
            if ($product) {
                $this->refreshProductStats($product);
                $this->realtime->productsChanged('review_updated', [
                    'product_id' => $product->id,
                    'review_id' => $review->id,
                ]);
            }
        }

        return $review->fresh();
    }

    public function refreshProductStats(Product $product): void
    {
        $stats = Review::query()
            ->where('product_id', $product->id)
            ->where('is_published', true)
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as avg_rating')
            ->first();

        $product->update([
            'reviews_count' => (int) ($stats->total ?? 0),
            'rating' => round((float) ($stats->avg_rating ?? 0), 2),
        ]);

        ProductService::flushListCache();
    }
}
