<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\JawabanTryout;

class HasilTryout extends Model
{
    use HasFactory;

    protected $table = 'hasil_tryout';

    protected $fillable = [
        'user_id',
        'bank_soal_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'total_nilai',
        'total_batas_nilai',
        'jumlah_soal',
        'jumlah_benar',
        'jumlah_salah',
        'durasi',
    ];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'total_nilai' => 'integer',
        'total_batas_nilai' => 'integer',
        'jumlah_soal' => 'integer',
        'jumlah_benar' => 'integer',
        'jumlah_salah' => 'integer',
        'durasi' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bankSoal()
    {
        return $this->belongsTo(BankSoal::class);
    }

    public function kategoriResults()
    {
        return $this->hasMany(HasilTryoutKategori::class);
    }

    public function jawabanTryout()
    {
        return $this->hasMany(JawabanTryout::class);
    }
}
