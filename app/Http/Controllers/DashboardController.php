<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Materi;
use App\Models\BankSoal;
use App\Models\HasilTryout;
use App\Models\HasilTryoutKategori;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $newUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        $adminActive = User::where('role', 'admin')->count();

        $bankSoalCount = BankSoal::count();
        $tryoutActive = BankSoal::where('status', 'aktif')->count();
        $materiCount = Materi::count();

        $avgScore = round((float) HasilTryout::avg('total_nilai'), 1);
        $finishedTryout = HasilTryout::count();
        $studyMinutes = (int) HasilTryout::where('created_at', '>=', now()->subDays(7))->sum('durasi');
        $studyHours = round($studyMinutes / 60, 1);

        $trend = HasilTryout::select([
            DB::raw("DATE_FORMAT(tanggal_selesai, '%Y-%m') as month"),
            DB::raw('AVG(total_nilai) as avg_nilai'),
            DB::raw('COUNT(*) as peserta'),
        ])
            ->where('tanggal_selesai', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                $name = \Carbon\Carbon::createFromFormat('Y-m', $row->month)->isoFormat('MMM');
                return [
                    'name' => $name,
                    'nilai' => round((float) $row->avg_nilai, 1),
                    'peserta' => (int) $row->peserta,
                ];
            })
            ->values();

        $kategoriDistribusi = HasilTryoutKategori::with('kategori')
            ->select([
                'kategori_id',
                DB::raw('SUM(jumlah_benar) as benar'),
                DB::raw('SUM(jumlah_salah) as salah'),
            ])
            ->groupBy('kategori_id')
            ->get()
            ->map(function ($row) {
                return [
                    'name' => optional($row->kategori)->kategori ?? 'Kategori',
                    'benar' => (int) $row->benar,
                    'salah' => (int) $row->salah,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'new_users' => $newUsers,
                'admin_active' => $adminActive,
                'bank_soal' => $bankSoalCount,
                'tryout_active' => $tryoutActive,
                'materi' => $materiCount,
                'avg_score' => $avgScore,
                'study_hours' => $studyHours,
                'finished_tryout' => $finishedTryout,
            ],
            'trend' => $trend,
            'kategori_distribusi' => $kategoriDistribusi,
        ]);
    }
}
