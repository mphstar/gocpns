<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilTryoutKategori extends Model
{
    use HasFactory;

    protected $table = 'hasil_tryout_kategori';

    protected $fillable = [
        'hasil_tryout_id',
        'kategori_id',
        'jumlah_soal',
        'jumlah_benar',
        'jumlah_salah',
        'nilai',
        'batas_nilai',
    ];

    protected $casts = [
        'jumlah_soal' => 'integer',
        'jumlah_benar' => 'integer',
        'jumlah_salah' => 'integer',
        'nilai' => 'integer',
        'batas_nilai' => 'integer',
    ];

    public function hasilTryout()
    {
        return $this->belongsTo(HasilTryout::class);
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }
}
