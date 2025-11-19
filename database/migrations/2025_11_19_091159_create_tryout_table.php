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
        // tabel hasil tryout
        Schema::create('hasil_tryout', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('bank_soal_id')->constrained('bank_soal')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamp('tanggal_mulai')->nullable();
            $table->timestamp('tanggal_selesai')->nullable();
            $table->integer('total_nilai')->default(0);
            $table->integer('total_batas_nilai')->default(0);
            $table->integer('jumlah_soal')->default(0);
            $table->integer('jumlah_benar')->default(0);
            $table->integer('jumlah_salah')->default(0);
            $table->integer('durasi')->nullable(); // durasi dalam menit
            $table->timestamps();
        });

        // detail nilai per kategori pada hasil tryout
        Schema::create('hasil_tryout_kategori', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hasil_tryout_id')->constrained('hasil_tryout')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('restrict')->onUpdate('cascade');
            $table->integer('jumlah_soal')->default(0);
            $table->integer('jumlah_benar')->default(0);
            $table->integer('jumlah_salah')->default(0);
            $table->integer('nilai')->default(0);
            $table->integer('batas_nilai')->default(0);
            $table->timestamps();
            $table->unique(['hasil_tryout_id', 'kategori_id']);
        });

        // tabel jawaban peserta pada tryout
        Schema::create('jawaban_tryout', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hasil_tryout_id')->constrained('hasil_tryout')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('detail_bank_soal_id')->constrained('detail_bank_soal')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('jawaban_bank_soal_id')->nullable()->constrained('jawaban_bank_soal')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('jawaban_opsi', ['A','B','C','D'])->nullable();
            $table->integer('nilai')->default(0);
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_tryout');
        Schema::dropIfExists('hasil_tryout_kategori');
        Schema::dropIfExists('hasil_tryout');
    }
};
