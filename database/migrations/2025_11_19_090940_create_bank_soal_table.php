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
        Schema::create('bank_soal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jenis_tryout_id')->constrained('jenis_tryout')->onDelete('restrict')->onUpdate('cascade');
            $table->string('judul', 100);
            $table->integer('waktu_pengerjaan')->default(60);
            $table->enum('status', ['aktif', 'tidak_aktif'])->default('aktif');
            $table->integer('total_batas_nilai')->default(0);
            $table->integer('total_soal')->default(0);
            $table->timestamps();
        });

        // konfigurasi batas nilai per kategori pada bank soal
        Schema::create('bank_soal_kategori', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_soal_id')->constrained('bank_soal')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('restrict')->onUpdate('cascade');
            $table->integer('batas_nilai')->default(0);
            $table->integer('jumlah_soal')->default(0);
            $table->timestamps();
            $table->unique(['bank_soal_id', 'kategori_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_soal_kategori');
        Schema::dropIfExists('bank_soal');
    }
};
