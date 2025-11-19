<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JenisTryout extends Model
{
    use HasFactory;

    protected $table = 'jenis_tryout';

    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
    ];

    public function bankSoal()
    {
        return $this->hasMany(BankSoal::class);
    }
}
