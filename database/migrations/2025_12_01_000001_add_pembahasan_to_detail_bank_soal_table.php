<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detail_bank_soal', function (Blueprint $table) {
            $table->text('pembahasan')->nullable()->after('soal');
            $table->string('pembahasan_file')->nullable()->after('pembahasan');
        });
    }

    public function down(): void
    {
        Schema::table('detail_bank_soal', function (Blueprint $table) {
            $table->dropColumn(['pembahasan', 'pembahasan_file']);
        });
    }
};
