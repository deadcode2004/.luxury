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
     * @param  array{product_id: int, rating: int, comment: string, author_name?: string|null}  $data
     */
    public function create(?User $user, array $data): Review
    {
        $product = Product::query()->whereKey($data['product_id'])->firstOrFail();
        $commentLocales = $this->translator->bilingualFromText((string) $data['comment']);
        $authorLocales = $this->resolveAuthorLocales($user, $data['author_name'] ?? null);
        $avatar = $this->resolveAuthorAvatar($user, $authorLocales);

        $review = Review::query()->create([
            'code' => 'rv-'.Str::lower(Str::random(8)),
            'product_id' => $product->id,
            'user_id' => $user?->id,
            'author' => $authorLocales,
            'author_avatar' => $avatar,
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
     * @param  array{rating?: int, comment?: string, author_name?: string|null}  $data
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

        if (array_key_exists('author_name', $data) && trim((string) $data['author_name']) !== '') {
            $previousAuthor = is_array($review->author) ? $review->author : [];
            $payload['author'] = $this->translator->bilingualFromText(
                (string) $data['author_name'],
                $previousAuthor
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

    /**
     * @return array{ar: string, en: string}
     */
    private function resolveAuthorLocales(?User $user, mixed $authorName): array
    {
        if ($user) {
            $name = trim((string) ($user->name ?: trim(($user->first_name ?? '').' '.($user->last_name ?? ''))));
            if ($name !== '') {
                return $this->translator->bilingualFromText($name);
            }
        }

        $guest = trim((string) ($authorName ?? ''));
        if ($guest !== '') {
            return $this->translator->bilingualFromText($guest);
        }

        return ['ar' => 'زائر', 'en' => 'Guest'];
    }

    /**
     * @param  array{ar: string, en: string}  $authorLocales
     */
    private function resolveAuthorAvatar(?User $user, array $authorLocales): ?string
    {
        $avatar = trim((string) ($user?->avatar ?? ''));
        if ($avatar !== '') {
            return $avatar;
        }

        $label = trim((string) ($authorLocales['en'] ?: $authorLocales['ar'] ?: 'Guest'));

        return 'https://ui-avatars.com/api/?name='.urlencode($label).'&background=1a1a1a&color=ffffff&size=128&bold=true';
    }
}
