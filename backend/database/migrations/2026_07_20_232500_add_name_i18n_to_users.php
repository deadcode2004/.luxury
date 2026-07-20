<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'first_name_i18n')) {
                $table->json('first_name_i18n')->nullable()->after('first_name');
            }
            if (! Schema::hasColumn('users', 'last_name_i18n')) {
                $table->json('last_name_i18n')->nullable()->after('last_name');
            }
            if (! Schema::hasColumn('users', 'name_i18n')) {
                $table->json('name_i18n')->nullable()->after('name');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            foreach (['first_name_i18n', 'last_name_i18n', 'name_i18n'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
