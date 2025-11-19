<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankSoal extends Model
{
    use HasFactory;

    protected $table = 'bank_soal';

    protected $fillable = [
        'jenis_tryout_id',
        'judul',
        'waktu_pengerjaan',
        'status',
        'total_batas_nilai',
        'total_soal',
    ];

    protected $casts = [
        'waktu_pengerjaan' => 'integer',
        'total_batas_nilai' => 'integer',
        'total_soal' => 'integer',
    ];

    public function jenisTryout()
    {
        return $this->belongsTo(JenisTryout::class);
    }

    public function kategoriKonfigurasi()
    {
        return $this->hasMany(BankSoalKategori::class);
    }

    public function detail()
    {
        return $this->hasMany(DetailBankSoal::class);
    }
}
