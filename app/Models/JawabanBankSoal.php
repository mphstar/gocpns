<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JawabanBankSoal extends Model
{
    use HasFactory;

    protected $table = 'jawaban_bank_soal';

    protected $fillable = [
        'detail_bank_soal_id',
        'opsi',
        'jawaban',
        'gambar_jawaban',
        'nilai',
        'is_correct',
    ];

    protected $casts = [
        'nilai' => 'integer',
        'is_correct' => 'boolean',
    ];

    public function detail()
    {
        return $this->belongsTo(DetailBankSoal::class, 'detail_bank_soal_id');
    }
}
