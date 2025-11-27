<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\HasilTryout;
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

        $materi = Materi::with('kategori')
            ->latest()
            ->take(6)
            ->get()
            ->map(function (Materi $item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'kategori' => $item->kategori?->kategori,
                    'kategori_id' => $item->kategori_id,
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
        $kategoriId = (int) $request->query('kategori_id', 0);

        $categories = Kategori::orderBy('kategori')->get(['id', 'kategori']);

        $materi = Materi::with('kategori')
            ->when($kategoriId, fn (Builder $q) => $q->where('kategori_id', $kategoriId))
            ->latest()
            ->paginate(10)
            ->through(function (Materi $item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'kategori' => $item->kategori?->kategori,
                    'kategori_id' => $item->kategori_id,
                    'file_url' => $item->file ? asset($item->file) : null,
                ];
            });

        return Inertia::render('users/materi', [
            'categories' => $categories,
            'selectedKategoriId' => $kategoriId ?: null,
            'materi' => $materi,
        ]);
    }

    public function tryout(Request $request)
    {
        $kategoriId = (int) $request->query('kategori_id', 0);

        $categories = Kategori::orderBy('kategori')->get(['id', 'kategori']);

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
        ]);
    }

    public function riwayat(Request $request)
    {
        $user = Auth::user();
        $kategoriId = (int) $request->query('kategori_id', 0);
        $categories = Kategori::orderBy('kategori')->get(['id', 'kategori']);

        $riwayat = HasilTryout::with([
            'bankSoal:id,judul',
            'kategoriResults' => function ($query) use ($kategoriId) {
                $query->with('kategori:id,kategori')
                    ->when($kategoriId, fn (Builder $q) => $q->where('kategori_id', $kategoriId));
            },
        ])
            ->where('user_id', $user->id ?? 0)
            ->when($kategoriId, fn (Builder $q) => $q->whereHas('kategoriResults', fn (Builder $sub) => $sub->where('kategori_id', $kategoriId)))
            ->latest()
            ->paginate(10)
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

        return Inertia::render('users/history', [
            'categories' => $categories,
            'selectedKategoriId' => $kategoriId ?: null,
            'riwayat' => $riwayat,
        ]);
    }
}
