<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('countries', function (Blueprint $table) {
            $table->boolean('postal_code_required')->default(false)->after('is_active');
        });

        Schema::create('postal_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->foreignId('state_id')->constrained('states')->cascadeOnDelete();
            $table->foreignId('city_id')->constrained('cities')->cascadeOnDelete();
            $table->string('code', 20);
            $table->string('place_name_en', 180)->nullable();
            $table->string('place_name_ar', 180)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->unique(['city_id', 'code']);
            $table->index(['country_id', 'code']);
            $table->index(['state_id', 'code']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postal_codes');
        Schema::table('countries', function (Blueprint $table) {
            $table->dropColumn('postal_code_required');
        });
    }
};
