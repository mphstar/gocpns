<?php

namespace Database\Seeders;

use App\Models\CapaianKompetensi;
use App\Models\Kategori;
use App\Models\Kelas;
use App\Models\MataPelajaran;
use App\Models\Materi;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default user
        User::factory()->create([
            'name' => 'Bintang',
            'email' => 'bintang@gmail.com',
            'password' => bcrypt('12345678'),
            'role' => 'admin',
        ]);

        $kategori = collect([
            ['kategori' => 'TWK', 'kepanjangan' => 'Tes Wawasan Kebangsaan'],
            ['kategori' => 'TIU', 'kepanjangan' => 'Tes Intelegensi Umum'],
            ['kategori' => 'TKP', 'kepanjangan' => 'Tes Karakteristik Pribadi'],
        ])->map(function ($row) {
            return Kategori::firstOrCreate(['kategori' => $row['kategori']], $row);
        });
    }
}
