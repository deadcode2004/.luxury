<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->char('iso2', 2)->unique();
            $table->string('name_en', 120);
            $table->string('name_ar', 120);
            $table->string('phonecode', 8)->nullable();
            $table->string('flag', 16)->nullable();
            $table->string('currency', 8)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->string('code', 20)->nullable();
            $table->string('name_en', 160);
            $table->string('name_ar', 160);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['country_id', 'is_active']);
            $table->index(['country_id', 'code']);
            $table->index('name_en');
            $table->index('name_ar');
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained('countries')->cascadeOnDelete();
            $table->foreignId('state_id')->constrained('states')->cascadeOnDelete();
            $table->string('name_en', 160);
            $table->string('name_ar', 160);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedBigInteger('geoname_id')->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['state_id', 'is_active']);
            $table->index(['country_id', 'is_active']);
            $table->index('name_en');
            $table->index('name_ar');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
        Schema::dropIfExists('states');
        Schema::dropIfExists('countries');
    }
};
