<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankSoalKategori extends Model
{
    use HasFactory;

    protected $table = 'bank_soal_kategori';

    protected $fillable = [
        'bank_soal_id',
        'kategori_id',
        'batas_nilai',
        'jumlah_soal',
    ];

    protected $casts = [
        'batas_nilai' => 'integer',
        'jumlah_soal' => 'integer',
    ];

    public function bankSoal()
    {
        return $this->belongsTo(BankSoal::class);
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }
}
