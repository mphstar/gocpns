<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detail_bank_soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_soal_id')->constrained('bank_soal')->onDelete('cascade')->onUpdate('cascade');
            // gunakan kategori_id sebagai tipe soal (twk, tiu, tkp, dll.)
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('restrict');
            $table->integer('nomor'); // urutan soal
            $table->text('soal');
            $table->string('gambar_soal')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_bank_soal');
    }
};
