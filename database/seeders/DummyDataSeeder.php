<?php

namespace Database\Seeders;

use App\Models\BankSoal;
use App\Models\BankSoalKategori;
use App\Models\DetailBankSoal;
use App\Models\HasilTryout;
use App\Models\HasilTryoutKategori;
use App\Models\JawabanBankSoal;
use App\Models\JawabanTryout;
use App\Models\JenisTryout;
use App\Models\Kategori;
use App\Models\Materi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $user = User::first() ?? User::factory()->create(['name' => 'Demo User', 'email' => 'demo@example.com']);

            $kategori = collect([
                ['kategori' => 'TWK', 'kepanjangan' => 'Tes Wawasan Kebangsaan'],
                ['kategori' => 'TIU', 'kepanjangan' => 'Tes Intelegensi Umum'],
                ['kategori' => 'TKP', 'kepanjangan' => 'Tes Karakteristik Pribadi'],
            ])->map(function ($row) {
                return Kategori::firstOrCreate(['kategori' => $row['kategori']], $row);
            });

            $jenis = JenisTryout::firstOrCreate(['nama' => 'SKD CPNS'], ['kode' => 'SKD-01']);

            // Materi
            foreach (range(1, 12) as $i) {
                Materi::updateOrCreate(
                    ['name' => "Materi Demo {$i}"],
                    [
                        'kategori_id' => $kategori->random()->id,
                        'file' => 'public/dummy/materi-demo.pdf',
                    ]
                );
            }

            // Bank Soal + detail
            $bankSoal = BankSoal::updateOrCreate(
                ['judul' => 'Paket Simulasi SKD Demo'],
                [
                    'jenis_tryout_id' => $jenis->id,
                    'waktu_pengerjaan' => 90,
                    'status' => 'aktif',
                    'total_batas_nilai' => 450,
                    'total_soal' => 30,
                ]
            );

            $bankSoal->kategoriKonfigurasi()->delete();
            $kategori->each(function ($kat) use ($bankSoal) {
                BankSoalKategori::create([
                    'bank_soal_id' => $bankSoal->id,
                    'kategori_id' => $kat->id,
                    'batas_nilai' => 150,
                    'jumlah_soal' => 10,
                ]);
            });

            $bankSoal->detail()->delete();

            foreach (range(1, 30) as $nomor) {
                $kat = $kategori->random();
                $detail = DetailBankSoal::create([
                    'bank_soal_id' => $bankSoal->id,
                    'kategori_id' => $kat->id,
                    'nomor' => $nomor,
                    'soal' => "Contoh soal nomor {$nomor} untuk kategori {$kat->kategori}",
                ]);

                $options = ['A', 'B', 'C', 'D'];
                foreach ($options as $opt) {
                    JawabanBankSoal::create([
                        'detail_bank_soal_id' => $detail->id,
                        'opsi' => $opt,
                        'jawaban' => "Jawaban {$opt} untuk soal {$nomor}",
                        'nilai' => $opt === 'A' ? 5 : 0,
                        'is_correct' => $opt === 'A',
                    ]);
                }
            }

            // Bersihkan riwayat dummy user agar konsisten
            $existingHasilIds = HasilTryout::where('user_id', $user->id)->pluck('id');
            if ($existingHasilIds->isNotEmpty()) {
                JawabanTryout::whereIn('hasil_tryout_id', $existingHasilIds)->delete();
                HasilTryoutKategori::whereIn('hasil_tryout_id', $existingHasilIds)->delete();
                HasilTryout::whereIn('id', $existingHasilIds)->delete();
            }

            $details = DetailBankSoal::with('jawaban')->where('bank_soal_id', $bankSoal->id)->get();

            // Buat beberapa riwayat tryout untuk simulasi
            $attempts = [
                ['days_ago' => 7, 'answered' => 28, 'durasi' => 88],
                ['days_ago' => 3, 'answered' => 24, 'durasi' => 75],
                ['days_ago' => 1, 'answered' => 30, 'durasi' => 82],
            ];

            foreach ($attempts as $idx => $data) {
                $startAt = now()->subDays($data['days_ago'])->setTime(9 + $idx, 0);
                $finishAt = (clone $startAt)->addMinutes($data['durasi']);

                $hasil = HasilTryout::create([
                    'user_id' => $user->id,
                    'bank_soal_id' => $bankSoal->id,
                    'tanggal_mulai' => $startAt,
                    'tanggal_selesai' => $finishAt,
                    'total_nilai' => 0,
                    'total_batas_nilai' => $bankSoal->total_batas_nilai,
                    'jumlah_soal' => $bankSoal->total_soal,
                    'jumlah_benar' => 0,
                    'jumlah_salah' => 0,
                    'durasi' => $data['durasi'],
                ]);

                $selectedDetails = $details->shuffle()->take($data['answered']);
                $correct = 0;
                $score = 0;
                $answeredPerKategori = [];

                foreach ($selectedDetails as $detail) {
                    $jawaban = $detail->jawaban->random();
                    JawabanTryout::create([
                        'hasil_tryout_id' => $hasil->id,
                        'detail_bank_soal_id' => $detail->id,
                        'jawaban_bank_soal_id' => $jawaban->id,
                        'jawaban_opsi' => $jawaban->opsi,
                        'nilai' => $jawaban->nilai,
                        'is_correct' => $jawaban->is_correct,
                    ]);

                    $answeredPerKategori[$detail->kategori_id]['answered'] = ($answeredPerKategori[$detail->kategori_id]['answered'] ?? 0) + 1;
                    $answeredPerKategori[$detail->kategori_id]['benar'] = ($answeredPerKategori[$detail->kategori_id]['benar'] ?? 0) + ($jawaban->is_correct ? 1 : 0);
                    $answeredPerKategori[$detail->kategori_id]['nilai'] = ($answeredPerKategori[$detail->kategori_id]['nilai'] ?? 0) + ($jawaban->nilai ?? 0);

                    if ($jawaban->is_correct) {
                        $correct++;
                        $score += $jawaban->nilai ?? 0;
                    } else {
                        $score += $jawaban->nilai ?? 0;
                    }
                }

                $answeredCount = $selectedDetails->count();
                $wrong = max(0, $answeredCount - $correct);
                $hasil->update([
                    'total_nilai' => $score,
                    'jumlah_benar' => $correct,
                    'jumlah_salah' => $wrong,
                ]);

                foreach ($kategori as $kat) {
                    $catAnswered = $answeredPerKategori[$kat->id]['answered'] ?? 0;
                    $catBenar = $answeredPerKategori[$kat->id]['benar'] ?? 0;
                    $catNilai = $answeredPerKategori[$kat->id]['nilai'] ?? 0;
                    $catSalah = max(0, $catAnswered - $catBenar);

                    HasilTryoutKategori::create([
                        'hasil_tryout_id' => $hasil->id,
                        'kategori_id' => $kat->id,
                        'jumlah_soal' => 10,
                        'jumlah_benar' => $catBenar,
                        'jumlah_salah' => $catSalah,
                        'nilai' => $catNilai,
                        'batas_nilai' => 150,
                    ]);
                }
            }
        });
    }
}
