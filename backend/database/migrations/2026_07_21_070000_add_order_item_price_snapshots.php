<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('product_image', 500)->nullable()->after('product_name');
            $table->decimal('original_unit_price', 12, 2)->nullable()->after('unit_price');
            $table->decimal('unit_discount', 12, 2)->default(0)->after('original_unit_price');
            $table->decimal('line_discount', 12, 2)->default(0)->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'product_image',
                'original_unit_price',
                'unit_discount',
                'line_discount',
            ]);
        });
    }
};
