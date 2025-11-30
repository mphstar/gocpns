<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('materi') && Schema::hasColumn('materi', 'kategori_id')) {
            Schema::table('materi', function (Blueprint $table) {
                $table->dropConstrainedForeignId('kategori_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('materi') && ! Schema::hasColumn('materi', 'kategori_id')) {
            Schema::table('materi', function (Blueprint $table) {
                $table->foreignId('kategori_id')->nullable()->constrained('kategori')->nullOnDelete();
            });
        }
    }
};
