<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'is_offer')) {
                $table->boolean('is_offer')->default(false)->after('is_best_seller');
                $table->index('is_offer');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'is_offer')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_offer']);
            $table->dropColumn('is_offer');
        });
    }
};
