<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailBankSoal extends Model
{
    use HasFactory;

    protected $table = 'detail_bank_soal';

    protected $fillable = [
        'bank_soal_id',
        'kategori_id',
        'nomor',
        'soal',
        'gambar_soal',
    ];

    protected $casts = [
        'nomor' => 'integer',
    ];

    public function bankSoal()
    {
        return $this->belongsTo(BankSoal::class);
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function jawaban()
    {
        return $this->hasMany(JawabanBankSoal::class);
    }
}
