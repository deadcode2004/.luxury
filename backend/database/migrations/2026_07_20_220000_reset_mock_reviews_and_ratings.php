<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reviews') || ! Schema::hasTable('products')) {
            return;
        }

        // Remove seeded site-wide mock testimonials (r1–r3) and orphan reviews.
        DB::table('reviews')
            ->whereNull('product_id')
            ->orWhereIn('code', ['r1', 'r2', 'r3'])
            ->delete();

        // Reset fake aggregate ratings so products start with zero reviews.
        DB::table('products')->update([
            'rating' => 0,
            'reviews_count' => 0,
        ]);
    }

    public function down(): void
    {
        // Irreversible data cleanup.
    }
};
