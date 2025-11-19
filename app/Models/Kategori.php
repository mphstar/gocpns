<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory;

    protected $table = 'kategori';

    protected $fillable = [
        'kategori',
        'kepanjangan',
    ];

    public function materi()
    {
        return $this->hasMany(Materi::class);
    }

    public function detailBankSoal()
    {
        return $this->hasMany(DetailBankSoal::class);
    }
}
