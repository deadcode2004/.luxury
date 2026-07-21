<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasColumn('orders', 'currency')) {
            return;
        }

        // Align existing installs: order amounts use EGP (single source of truth).
        DB::table('orders')->where('currency', 'SAR')->update(['currency' => 'EGP']);

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY currency VARCHAR(3) NOT NULL DEFAULT 'EGP'");
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasColumn('orders', 'currency')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE orders MODIFY currency VARCHAR(3) NOT NULL DEFAULT 'SAR'");
        }
    }
};
