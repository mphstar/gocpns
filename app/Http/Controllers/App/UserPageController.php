<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\DetailBankSoal;
use App\Models\HasilTryout;
use App\Models\HasilTryoutKategori;
use App\Models\JawabanBankSoal;
use App\Models\JawabanTryout;
use App\Models\Kategori;
use App\Models\Materi;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserPageController extends Controller
{
    public function home(Request $request)
    {
        $user = Auth::user();

        $materi = Materi::query()
            ->latest()
            ->take(6)
            ->get()
            ->map(function (Materi $item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_url' => $item->file ? asset($item->file) : null,
                ];
            });

        $tryouts = BankSoal::with(['jenisTryout:id,nama', 'kategoriKonfigurasi.kategori:id,kategori'])
            ->where('status', 'aktif')
            ->latest()
            ->take(6)
            ->get()
            ->map(function (BankSoal $item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->judul,
                    'jenis' => $item->jenisTryout?->nama,
                    'durasi' => $item->waktu_pengerjaan,
                    'kategori' => $item->kategoriKonfigurasi->pluck('kategori.kategori')->filter()->values(),
                ];
            });

        $riwayat = HasilTryout::with([
            'bankSoal:id,judul',
            'kategoriResults.kategori:id,kategori',
        ])
            ->where('user_id', $user->id ?? 0)
            ->latest()
            ->take(5)
            ->get()
            ->map(function (HasilTryout $item) {
                return [
                    'id' => $item->id,
                    'bank_soal' => $item->bankSoal?->judul,
                    'tanggal_selesai' => optional($item->tanggal_selesai)->toDateTimeString(),
                    'total_nilai' => $item->total_nilai,
                    'total_batas_nilai' => $item->total_batas_nilai,
                    'jumlah_soal' => $item->jumlah_soal,
                    'kategori' => $item->kategoriResults->map(function ($row) {
                        return [
                            'nama' => $row->kategori?->kategori,
                            'nilai' => $row->nilai,
                            'batas_nilai' => $row->batas_nilai,
                        ];
                    }),
                ];
            });

        return Inertia::render('users/home', [
            'materi' => $materi,
            'tryouts' => $tryouts,
            'riwayat' => $riwayat,
        ]);
    }

    public function materi(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $materi = Materi::query()
            ->when($search, fn (Builder $q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(10)
            ->through(function (Materi $item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_url' => $item->file ? asset($item->file) : null,
                ];
            });

        return Inertia::render('users/materi', [
            'search' => $search,
            'materi' => $materi,
        ]);
    }

    public function tryout(Request $request)
    {
        $kategoriId = (int) $request->query('kategori_id', 0);
        $userId = Auth::id();

        $categories = Kategori::orderBy('kategori')->get(['id', 'kategori']);

        $ongoingRaw = HasilTryout::with('bankSoal')
            ->where('user_id', $userId)
            ->whereNull('tanggal_selesai')
            ->get();

        $ongoingList = $ongoingRaw->filter(function ($row) {
            $durasi = max(0, ($row->bankSoal->waktu_pengerjaan ?? 0) * 60);
            $start = $row->tanggal_mulai ?? $row->created_at;
            if (!$start) {
                return false;
            }
            $elapsed = max(0, now()->getTimestamp() - $start->getTimestamp());
            if ($elapsed >= $durasi) {
                // auto-finish expired session
                $this->finishTryout($row);
                return false;
            }
            return true;
        });

        $tryouts = BankSoal::with(['jenisTryout:id,nama', 'kategoriKonfigurasi.kategori:id,kategori'])
            ->where('status', 'aktif')
            ->when($kategoriId, function (Builder $q) use ($kategoriId) {
                $q->whereHas('kategoriKonfigurasi', fn (Builder $sub) => $sub->where('kategori_id', $kategoriId));
            })
            ->latest()
            ->paginate(9)
            ->through(function (BankSoal $item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->judul,
                    'jenis' => $item->jenisTryout?->nama,
                    'durasi' => $item->waktu_pengerjaan,
                    'kategori' => $item->kategoriKonfigurasi->pluck('kategori.kategori')->filter()->values(),
                ];
            });

        return Inertia::render('users/tryout', [
            'categories' => $categories,
            'selectedKategoriId' => $kategoriId ?: null,
            'tryouts' => $tryouts,
            'ongoing' => $ongoingList->mapWithKeys(function ($row) {
                return [
                    $row->bank_soal_id => [
                        'session_id' => $row->id,
                        'bank_soal_id' => $row->bank_soal_id,
                        'judul' => $row->bankSoal?->judul,
                    ],
                ];
            }),
        ]);
    }

    public function take(BankSoal $bankSoal)
    {
        abort_if($bankSoal->status !== 'aktif', 404);

        $bankSoal->load([
            'jenisTryout:id,nama',
            'kategoriKonfigurasi.kategori:id,kategori',
            'detail' => function ($q) {
                $q->orderBy('nomor')
                    ->with([
                        'kategori:id,kategori',
                        'jawaban' => fn ($sub) => $sub->orderBy('opsi'),
                    ]);
            },
        ]);

        $userId = Auth::id();

        $hasilTryout = HasilTryout::where('user_id', $userId)
            ->where('bank_soal_id', $bankSoal->id)
            ->whereNull('tanggal_selesai')
            ->latest()
            ->first();

        if (!$hasilTryout) {
            $hasilTryout = HasilTryout::create([
                'user_id' => $userId,
                'bank_soal_id' => $bankSoal->id,
                'tanggal_mulai' => now(),
                'total_batas_nilai' => $bankSoal->total_batas_nilai,
                'jumlah_soal' => $bankSoal->detail->count(),
            ]);
        } elseif (!$hasilTryout->tanggal_mulai) {
            $hasilTryout->update(['tanggal_mulai' => $hasilTryout->created_at ?? now()]);
            $hasilTryout->refresh();
        }

        // hitung sisa waktu berdasarkan timestamp mulai yang tersimpan
        $startAt = $hasilTryout->tanggal_mulai ?? $hasilTryout->created_at ?? now();
        $totalSeconds = max(0, ($bankSoal->waktu_pengerjaan ?? 0) * 60);
        $elapsed = max(0, now()->getTimestamp() - $startAt->getTimestamp());
        $remainingSeconds = max(0, $totalSeconds - $elapsed);

        if ($remainingSeconds <= 0 && $hasilTryout->tanggal_selesai === null) {
            // sesi kedaluwarsa, selesaikan dan mulai baru
            $this->finishTryout($hasilTryout);
            $hasilTryout = HasilTryout::create([
                'user_id' => $userId,
                'bank_soal_id' => $bankSoal->id,
                'tanggal_mulai' => now(),
                'total_batas_nilai' => $bankSoal->total_batas_nilai,
                'jumlah_soal' => $bankSoal->detail->count(),
            ]);
            $startAt = $hasilTryout->tanggal_mulai;
            $elapsed = 0;
            $remainingSeconds = $totalSeconds;
        }

        $jawabanTerpilih = JawabanTryout::where('hasil_tryout_id', $hasilTryout->id)
            ->pluck('jawaban_bank_soal_id', 'detail_bank_soal_id')
            ->toArray();

        $questions = $bankSoal->detail->map(function (DetailBankSoal $detail) {
            return [
                'id' => $detail->id,
                'nomor' => $detail->nomor,
                'soal' => $detail->soal,
                'kategori' => $detail->kategori?->kategori,
                'gambar_soal' => $detail->gambar_soal ? asset($detail->gambar_soal) : null,
                'jawaban' => $detail->jawaban->map(function ($jawab) {
                    return [
                        'id' => $jawab->id,
                        'opsi' => $jawab->opsi,
                        'teks' => $jawab->jawaban,
                        'gambar' => $jawab->gambar_jawaban ? asset($jawab->gambar_jawaban) : null,
                    ];
                }),
            ];
        });

        return Inertia::render('users/tryout-take', [
            'tryout' => [
                'id' => $bankSoal->id,
                'judul' => $bankSoal->judul,
                'jenis' => $bankSoal->jenisTryout?->nama,
                'durasi' => $bankSoal->waktu_pengerjaan,
                'kategori' => $bankSoal->kategoriKonfigurasi->pluck('kategori.kategori')->filter()->values(),
            ],
            'questions' => $questions,
            'session' => [
                'id' => $hasilTryout->id,
                'remaining_seconds' => $remainingSeconds,
                'answers' => $jawabanTerpilih,
                'started_at' => optional($hasilTryout->tanggal_mulai)->toDateTimeString(),
            ],
        ]);
    }

    public function riwayat(Request $request)
    {
        $user = Auth::user();
        $kategoriId = (int) $request->query('kategori_id', 0);
        $limit = (int) $request->query('limit', 10);
        $tryoutId = $request->query('tryout_id');
        $from = $request->query('from');
        $to = $request->query('to');
        $categories = Kategori::orderBy('kategori')->get(['id', 'kategori']);

        $riwayat = HasilTryout::with([
            'bankSoal:id,judul',
            'kategoriResults' => function ($query) use ($kategoriId) {
                $query->with('kategori:id,kategori')
                    ->when($kategoriId, fn (Builder $q) => $q->where('kategori_id', $kategoriId));
            },
        ])
            ->where('user_id', $user->id ?? 0)
            ->when($tryoutId && $tryoutId !== 'all', fn (Builder $q) => $q->where('bank_soal_id', $tryoutId))
            ->when($kategoriId, fn (Builder $q) => $q->whereHas('kategoriResults', fn (Builder $sub) => $sub->where('kategori_id', $kategoriId)))
            ->when($from, fn (Builder $q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn (Builder $q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate($limit > 0 ? $limit : 10)
            ->through(function (HasilTryout $item) {
                return [
                    'id' => $item->id,
                    'bank_soal' => $item->bankSoal?->judul,
                    'tanggal_selesai' => optional($item->tanggal_selesai)->toDateTimeString(),
                    'total_nilai' => $item->total_nilai,
                    'total_batas_nilai' => $item->total_batas_nilai,
                    'jumlah_soal' => $item->jumlah_soal,
                    'jumlah_benar' => $item->jumlah_benar,
                    'jumlah_salah' => $item->jumlah_salah,
                    'durasi' => $item->durasi,
                    'kategori' => $item->kategoriResults->map(function ($row) {
                        return [
                            'nama' => $row->kategori?->kategori,
                            'nilai' => $row->nilai,
                            'batas_nilai' => $row->batas_nilai,
                        ];
                    }),
                ];
            });

        // Analisis per tryout (total benar/salah)
        $tryoutAnalysis = HasilTryout::with(['bankSoal:id,judul'])
            ->where('user_id', $user->id ?? 0)
            ->when($tryoutId && $tryoutId !== 'all', fn (Builder $q) => $q->where('bank_soal_id', $tryoutId))
            ->when($from, fn (Builder $q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn (Builder $q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->take(15)
            ->get()
            ->map(function (HasilTryout $row) {
                return [
                    'id' => $row->id,
                    'judul' => $row->bankSoal?->judul,
                    'tanggal' => optional($row->tanggal_selesai ?? $row->created_at)->toDateTimeString(),
                    'benar' => $row->jumlah_benar ?? 0,
                    'salah' => $row->jumlah_salah ?? 0,
                    'total_nilai' => $row->total_nilai ?? 0,
                    'total_batas_nilai' => $row->total_batas_nilai ?? 0,
                ];
            });

        // Analisis per kategori (akumulasi)
        $kategoriAnalysis = HasilTryoutKategori::with('kategori:id,kategori')
            ->whereHas('hasilTryout', function (Builder $q) use ($user, $from, $to) {
                $q->where('user_id', $user->id ?? 0)
                    ->when($from, fn (Builder $qq) => $qq->whereDate('created_at', '>=', $from))
                    ->when($to, fn (Builder $qq) => $qq->whereDate('created_at', '<=', $to));
            })
            ->when($tryoutId && $tryoutId !== 'all', function (Builder $q) use ($tryoutId) {
                $q->whereHas('hasilTryout', fn (Builder $sub) => $sub->where('bank_soal_id', $tryoutId));
            })
            ->get()
            ->groupBy('kategori_id')
            ->map(function ($rows) {
                $nama = optional($rows->first()->kategori)->kategori;
                $benar = $rows->sum('jumlah_benar');
                $salah = $rows->sum('jumlah_salah');
                $nilai = $rows->sum('nilai');
                $batas = $rows->sum('batas_nilai');
                return [
                    'nama' => $nama,
                    'benar' => $benar,
                    'salah' => $salah,
                    'nilai' => $nilai,
                    'batas_nilai' => $batas,
                ];
            })
            ->values();

        // Perbandingan setiap percobaan per tryout (berdasarkan pilihan)
        $perTryoutRaw = HasilTryout::with('bankSoal:id,judul')
            ->where('user_id', $user->id ?? 0)
            ->when($from, fn (Builder $q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn (Builder $q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->get()
            ->groupBy('bank_soal_id');

        $tryoutOptions = $perTryoutRaw->map(function ($rows, $bankSoalId) {
            return [
                'id' => $bankSoalId,
                'judul' => optional($rows->first()->bankSoal)->judul ?? 'Tryout',
            ];
        })->values();

        $selectedTryoutId = $tryoutId && $tryoutId !== 'all' && $perTryoutRaw->has((int) $tryoutId)
            ? (int) $tryoutId
            : ($perTryoutRaw->keys()->first() ?? null);

        $perTryoutComparison = [];
        if ($selectedTryoutId && $perTryoutRaw->has($selectedTryoutId)) {
            $rows = $perTryoutRaw->get($selectedTryoutId)->sortBy('created_at')->values();
            $perTryoutComparison = [
                'judul' => optional($rows->first()->bankSoal)->judul ?? 'Tryout',
                'attempts' => $rows->map(function (HasilTryout $row) {
                    $tanggal = optional($row->tanggal_mulai ?? $row->created_at)->toDateTimeString();
                    return [
                        'name' => $tanggal,
                        'nilai' => $row->total_nilai ?? 0,
                        'batas' => $row->total_batas_nilai ?? 0,
                        'benar' => $row->jumlah_benar ?? 0,
                        'salah' => $row->jumlah_salah ?? 0,
                        'tanggal' => $tanggal,
                    ];
                }),
            ];
        }

        return Inertia::render('users/history', [
            'categories' => $categories,
            'selectedKategoriId' => $kategoriId ?: null,
            'riwayat' => $riwayat,
            'filters' => [
                'limit' => $limit,
                'from' => $from,
                'to' => $to,
            ],
            'analysis' => [
                'tryouts' => $tryoutAnalysis,
                'kategori' => $kategoriAnalysis,
                'per_tryout' => $perTryoutComparison,
            ],
            'tryoutOptions' => $tryoutOptions,
            'selectedTryoutId' => $selectedTryoutId,
        ]);
    }

    public function riwayatDetail(HasilTryout $hasilTryout)
    {
        abort_if($hasilTryout->user_id !== Auth::id(), 403);

        $hasilTryout->load([
            'bankSoal.jenisTryout',
            'kategoriResults.kategori',
            'jawabanTryout.jawaban',
            'jawabanTryout.detail.kategori',
            'jawabanTryout.detail.jawaban' => fn ($q) => $q->where('is_correct', true),
        ]);

        $kategoriSummary = $hasilTryout->kategoriResults->map(function (HasilTryoutKategori $row) {
            return [
                'nama' => $row->kategori?->kategori ?? 'Kategori',
                'benar' => $row->jumlah_benar ?? 0,
                'salah' => $row->jumlah_salah ?? 0,
                'nilai' => $row->nilai ?? 0,
                'batas' => $row->batas_nilai ?? 0,
            ];
        })->values();

        $answers = $hasilTryout->jawabanTryout->map(function (JawabanTryout $jawab) {
            $detail = $jawab->detail;
            $correct = $detail?->jawaban?->first();
            return [
                'nomor' => $detail?->nomor,
                'soal' => $detail?->soal,
                'kategori' => $detail?->kategori?->kategori,
                'user_jawaban' => [
                    'opsi' => $jawab->jawaban_opsi,
                    'teks' => optional($jawab->jawaban)->jawaban,
                    'gambar' => optional($jawab->jawaban)->gambar_jawaban ? asset(optional($jawab->jawaban)->gambar_jawaban) : null,
                    'benar' => (bool) $jawab->is_correct,
                    'nilai' => $jawab->nilai ?? 0,
                ],
                'jawaban_benar' => $correct ? [
                    'opsi' => $correct->opsi,
                    'teks' => $correct->jawaban,
                    'gambar' => $correct->gambar_jawaban ? asset($correct->gambar_jawaban) : null,
                ] : null,
            ];
        })->sortBy('nomor')->values();

        return Inertia::render('users/history-detail', [
            'riwayat' => [
                'id' => $hasilTryout->id,
                'judul' => $hasilTryout->bankSoal?->judul,
                'jenis' => $hasilTryout->bankSoal?->jenisTryout?->nama,
                'tanggal_mulai' => optional($hasilTryout->tanggal_mulai ?? $hasilTryout->created_at)->toDateTimeString(),
                'tanggal_selesai' => optional($hasilTryout->tanggal_selesai)->toDateTimeString(),
                'durasi' => $hasilTryout->durasi,
                'nilai' => $hasilTryout->total_nilai,
                'batas_nilai' => $hasilTryout->total_batas_nilai,
                'benar' => $hasilTryout->jumlah_benar,
                'salah' => $hasilTryout->jumlah_salah,
                'jumlah_soal' => $hasilTryout->jumlah_soal,
            ],
            'kategori' => $kategoriSummary,
            'answers' => $answers,
        ]);
    }

    public function submitAnswer(Request $request, HasilTryout $hasilTryout)
    {
        abort_if($hasilTryout->user_id !== Auth::id(), 403);
        abort_if($hasilTryout->tanggal_selesai !== null, 400, 'Tryout sudah selesai');

        $data = $request->validate([
            'question_id' => 'required|exists:detail_bank_soal,id',
            'jawaban_id' => 'required|exists:jawaban_bank_soal,id',
        ]);

        $detailId = (int) $data['question_id'];
        $jawaban = JawabanBankSoal::where('id', $data['jawaban_id'])
            ->where('detail_bank_soal_id', $detailId)
            ->firstOrFail();

        JawabanTryout::updateOrCreate(
            [
                'hasil_tryout_id' => $hasilTryout->id,
                'detail_bank_soal_id' => $detailId,
            ],
            [
                'jawaban_bank_soal_id' => $jawaban->id,
                'jawaban_opsi' => $jawaban->opsi,
                'nilai' => $jawaban->nilai,
                'is_correct' => $jawaban->is_correct,
            ]
        );

        return back()->with('success', 'Jawaban disimpan');
    }

    public function finish(Request $request, HasilTryout $hasilTryout)
    {
        abort_if($hasilTryout->user_id !== Auth::id(), 403);
        if ($hasilTryout->tanggal_selesai) {
            return back()->with('success', 'Tryout sudah selesai');
        }

        $this->finishTryout($hasilTryout);

        return redirect()->route('app.riwayat')->with('success', 'Tryout selesai');
    }

    protected function finishTryout(HasilTryout $hasilTryout): void
    {
        $bankSoal = $hasilTryout->bankSoal()->with('detail.kategori', 'kategoriKonfigurasi')->first();
        $answers = $hasilTryout->jawabanTryout()->with('detail')->get();

        $totalNilai = $answers->sum('nilai');
        $jumlahBenar = $answers->where('is_correct', true)->count();
        $jumlahSalah = $answers->count() - $jumlahBenar;

        $startAt = $hasilTryout->tanggal_mulai ?? $hasilTryout->created_at ?? now();
        $elapsedSeconds = max(0, now()->getTimestamp() - $startAt->getTimestamp());
        $durasiMenit = (int) ceil($elapsedSeconds / 60);

        $hasilTryout->update([
            'tanggal_selesai' => now(),
            'total_nilai' => $totalNilai,
            'jumlah_benar' => $jumlahBenar,
            'jumlah_salah' => $jumlahSalah,
            'durasi' => $durasiMenit,
        ]);

        $hasilTryout->kategoriResults()->delete();

        $byKategori = $answers->groupBy(function (JawabanTryout $row) {
            return $row->detail?->kategori_id;
        });

        foreach ($byKategori as $kategoriId => $rows) {
            $jumlahSoalKat = $bankSoal?->detail?->where('kategori_id', $kategoriId)->count() ?? 0;
            HasilTryoutKategori::create([
                'hasil_tryout_id' => $hasilTryout->id,
                'kategori_id' => $kategoriId,
                'jumlah_soal' => $jumlahSoalKat,
                'jumlah_benar' => $rows->where('is_correct', true)->count(),
                'jumlah_salah' => $rows->where('is_correct', false)->count(),
                'nilai' => $rows->sum('nilai'),
                'batas_nilai' => $bankSoal?->kategoriKonfigurasi?->firstWhere('kategori_id', $kategoriId)?->batas_nilai ?? 0,
            ]);
        }
    }
}
