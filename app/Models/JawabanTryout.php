<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanTryout extends Model
{
    use HasFactory;

    protected $table = 'jawaban_tryout';

    protected $fillable = [
        'hasil_tryout_id',
        'detail_bank_soal_id',
        'jawaban_bank_soal_id',
        'jawaban_opsi',
        'nilai',
        'is_correct',
    ];

    protected $casts = [
        'nilai' => 'integer',
        'is_correct' => 'boolean',
    ];

    public function hasilTryout()
    {
        return $this->belongsTo(HasilTryout::class);
    }

    public function detail()
    {
        return $this->belongsTo(DetailBankSoal::class, 'detail_bank_soal_id');
    }

    public function jawabanBankSoal()
    {
        return $this->belongsTo(JawabanBankSoal::class);
    }

    public function jawaban()
    {
        return $this->belongsTo(JawabanBankSoal::class, 'jawaban_bank_soal_id');
    }
}
