<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HasilTryout;
use App\Models\HasilTryoutKategori;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $userId = (int) $request->query('user_id', 0);
        $from = $request->query('from');
        $to = $request->query('to');
        $tryoutId = $request->query('tryout_id');

        $users = User::orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        if (!$userId && $users->count()) {
            $userId = $users->first()['id'];
        }

        if (!$userId) {
            return Inertia::render('report', [
                'users' => $users,
                'selectedUserId' => null,
                'riwayat' => [],
                'analysis' => [
                    'tryouts' => [],
                    'kategori' => [],
                    'per_tryout' => null,
                ],
                'summary' => [
                    'total' => 0,
                    'avg' => 0,
                    'best' => 0,
                    'duration' => 0,
                ],
                'filters' => [
                    'from' => $from,
                    'to' => $to,
                    'tryout_id' => $tryoutId,
                ],
                'tryoutOptions' => [],
            ]);
        }

        $baseQuery = HasilTryout::with([
            'bankSoal:id,judul',
            'kategoriResults.kategori:id,kategori',
        ])
            ->where('user_id', $userId)
            ->when($tryoutId && $tryoutId !== 'all', fn (Builder $q) => $q->where('bank_soal_id', $tryoutId))
            ->when($from, fn (Builder $q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn (Builder $q) => $q->whereDate('created_at', '<=', $to));

        $riwayat = (clone $baseQuery)
            ->latest()
            ->take(12)
            ->get()
            ->map(function (HasilTryout $item) {
                return [
                    'id' => $item->id,
                    'judul' => $item->bankSoal?->judul,
                    'tanggal' => optional($item->tanggal_selesai ?? $item->created_at)->toDateTimeString(),
                    'nilai' => $item->total_nilai ?? 0,
                    'batas' => $item->total_batas_nilai ?? 0,
                    'benar' => $item->jumlah_benar ?? 0,
                    'salah' => $item->jumlah_salah ?? 0,
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

        $summaryQuery = (clone $baseQuery);
        $summary = [
            'total' => (clone $summaryQuery)->count(),
            'avg' => round((float) (clone $summaryQuery)->avg('total_nilai'), 1),
            'best' => round((float) (clone $summaryQuery)->max('total_nilai'), 1),
            'duration' => (int) (clone $summaryQuery)->sum('durasi'),
        ];

        $latest = (clone $baseQuery)->latest()->first();
        $summary['last_score'] = $latest?->total_nilai ?? null;

        $tryoutAnalysis = (clone $baseQuery)
            ->latest()
            ->take(20)
            ->get()
            ->map(function (HasilTryout $row) {
                return [
                    'id' => $row->id,
                    'name' => $row->bankSoal?->judul ?? 'Tryout',
                    'tanggal' => optional($row->tanggal_selesai ?? $row->created_at)->toDateTimeString(),
                    'nilai' => $row->total_nilai ?? 0,
                    'benar' => $row->jumlah_benar ?? 0,
                    'salah' => $row->jumlah_salah ?? 0,
                    'batas' => $row->total_batas_nilai ?? 0,
                ];
            });

        $kategoriAnalysis = HasilTryoutKategori::with('kategori:id,kategori')
            ->whereHas('hasilTryout', function (Builder $q) use ($userId, $from, $to, $tryoutId) {
                $q->where('user_id', $userId)
                    ->when($tryoutId && $tryoutId !== 'all', fn (Builder $qq) => $qq->where('bank_soal_id', $tryoutId))
                    ->when($from, fn (Builder $qq) => $qq->whereDate('created_at', '>=', $from))
                    ->when($to, fn (Builder $qq) => $qq->whereDate('created_at', '<=', $to));
            })
            ->get()
            ->groupBy('kategori_id')
            ->map(function ($rows) {
                $nama = optional($rows->first()->kategori)->kategori ?? 'Kategori';
                return [
                    'name' => $nama,
                    'nilai' => $rows->sum('nilai'),
                    'batas' => $rows->max('batas_nilai') ?? 0,
                    'benar' => $rows->sum('jumlah_benar'),
                    'salah' => $rows->sum('jumlah_salah'),
                ];
            })
            ->values();

        $perTryoutRaw = (clone $baseQuery)->get()->groupBy('bank_soal_id');
        $tryoutOptions = $perTryoutRaw->map(function ($rows, $bankSoalId) {
            return [
                'id' => $bankSoalId,
                'judul' => optional($rows->first()->bankSoal)->judul ?? 'Tryout',
            ];
        })->values();

        $selectedTryoutId = $tryoutId && $tryoutId !== 'all' && $perTryoutRaw->has((int) $tryoutId)
            ? (int) $tryoutId
            : ($perTryoutRaw->keys()->first() ?? null);

        $perTryoutComparison = null;
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

        return Inertia::render('report', [
            'users' => $users,
            'selectedUserId' => $userId,
            'riwayat' => $riwayat,
            'analysis' => [
                'tryouts' => $tryoutAnalysis,
                'kategori' => $kategoriAnalysis,
                'per_tryout' => $perTryoutComparison,
            ],
            'summary' => $summary,
            'filters' => [
                'from' => $from,
                'to' => $to,
                'tryout_id' => $tryoutId,
            ],
            'tryoutOptions' => $tryoutOptions,
        ]);
    }
}
