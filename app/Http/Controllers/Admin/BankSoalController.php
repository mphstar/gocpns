<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPagination;
use App\Http\Controllers\Controller;
use App\Models\BankSoal;
use App\Models\DetailBankSoal;
use App\Models\JawabanBankSoal;
use App\Models\JenisTryout;
use App\Models\Kategori;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BankSoalController extends Controller
{
    use HandlesPagination;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $search = trim((string) $request->input('search', ''));
        $jenisTryoutId = $request->input('jenis_tryout_id');
        $status = $request->input('status');

        $records = BankSoal::query()
            ->with(['jenisTryout:id,nama', 'kategoriKonfigurasi.kategori:id,kategori,kepanjangan'])
            ->withCount('detail')
            ->when($search, function ($query) use ($search) {
                $query->where('judul', 'like', "%{$search}%");
            })
            ->when($jenisTryoutId, function ($query) use ($jenisTryoutId) {
                $query->where('jenis_tryout_id', $jenisTryoutId);
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('bank-soal/view', [
            'records' => $this->inertiaPagination($records),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'jenis_tryout_id' => $jenisTryoutId,
                'status' => $status,
            ],
            'jenisTryoutOptions' => JenisTryout::orderBy('nama')->get(['id', 'nama']),
            'kategoriOptions' => Kategori::orderBy('kategori')->get(['id', 'kategori', 'kepanjangan']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateBankSoal($request);

        DB::transaction(function () use ($data) {
            $bankSoal = BankSoal::create([
                'jenis_tryout_id' => $data['jenis_tryout_id'],
                'judul' => $data['judul'],
                'waktu_pengerjaan' => $data['waktu_pengerjaan'],
                'status' => $data['status'],
                'total_batas_nilai' => $data['total_batas_nilai'],
                'total_soal' => $data['total_soal'],
            ]);

            $this->syncKategoriKonfigurasi($bankSoal, $data['kategori_config']);
        });

        return back()->with('success', 'Bank soal berhasil dibuat.');
    }

    public function update(Request $request, BankSoal $bankSoal)
    {
        $data = $this->validateBankSoal($request);

        DB::transaction(function () use ($data, $bankSoal) {
            $bankSoal->update([
                'jenis_tryout_id' => $data['jenis_tryout_id'],
                'judul' => $data['judul'],
                'waktu_pengerjaan' => $data['waktu_pengerjaan'],
                'status' => $data['status'],
                'total_batas_nilai' => $data['total_batas_nilai'],
                'total_soal' => $data['total_soal'],
            ]);

            $this->syncKategoriKonfigurasi($bankSoal, $data['kategori_config']);
        });

        return back()->with('success', 'Bank soal berhasil diperbarui.');
    }

    public function destroy(BankSoal $bankSoal)
    {
        $bankSoal->delete();

        return back()->with('success', 'Bank soal berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:bank_soal,id',
        ]);

        DB::transaction(function () use ($data) {
            BankSoal::whereIn('id', $data['ids'])->delete();
        });

        return back()->with('success', 'Bank soal terpilih berhasil dihapus.');
    }

    public function manage(BankSoal $bankSoal)
    {
        $bankSoal->load(['jenisTryout', 'kategoriKonfigurasi.kategori']);

        $questions = $bankSoal->detail()
            ->with([
                'kategori:id,kategori,kepanjangan',
                'jawaban' => function ($query) {
                    $query->orderBy('opsi');
                },
            ])
            ->orderBy('nomor')
            ->get();

        return Inertia::render('bank-soal/detail', [
            'bankSoal' => $bankSoal,
            'questions' => $questions,
            'kategoriOptions' => Kategori::orderBy('kategori')->get(['id', 'kategori', 'kepanjangan']),
        ]);
    }

    public function createDetailForm(BankSoal $bankSoal)
    {
        $bankSoal->load('jenisTryout');
        $kategoriOptions = Kategori::orderBy('kategori')->get(['id', 'kategori', 'kepanjangan']);
        $nextNomor = ($bankSoal->detail()->max('nomor') ?? 0) + 1;

        return Inertia::render('bank-soal/question-form', [
            'bankSoal' => $bankSoal,
            'kategoriOptions' => $kategoriOptions,
            'question' => null,
            'mode' => 'create',
            'nextNomor' => $nextNomor,
        ]);
    }

    public function editDetailForm(BankSoal $bankSoal, DetailBankSoal $detailBankSoal)
    {
        abort_if($detailBankSoal->bank_soal_id !== $bankSoal->id, 404);

        $bankSoal->load('jenisTryout');
        $detailBankSoal->load(['jawaban' => function ($query) {
            $query->orderBy('opsi');
        }]);

        return Inertia::render('bank-soal/question-form', [
            'bankSoal' => $bankSoal,
            'kategoriOptions' => Kategori::orderBy('kategori')->get(['id', 'kategori', 'kepanjangan']),
            'question' => $detailBankSoal,
            'mode' => 'update',
            'nextNomor' => $detailBankSoal->nomor,
        ]);
    }

    public function storeDetail(Request $request, BankSoal $bankSoal)
    {
        $data = $request->validate([
            'kategori_id' => 'required|exists:kategori,id',
            'nomor' => 'required|integer|min:1|unique:detail_bank_soal,nomor,NULL,id,bank_soal_id,' . $bankSoal->id,
            'soal' => 'required|string',
            'gambar_soal' => 'nullable|image|max:2048',
            'existing_gambar_soal' => 'nullable|string',
            'answers' => 'nullable|array|min:1',
            'answers.*.id' => 'nullable|integer|exists:jawaban_bank_soal,id',
            'answers.*.opsi' => 'required_with:answers|in:A,B,C,D',
            'answers.*.jawaban' => 'required_with:answers|string',
            'answers.*.nilai' => 'required_with:answers|integer|min:0',
            'answers.*.is_correct' => 'required_with:answers|boolean',
            'answers.*.gambar_jawaban' => 'nullable|image|max:2048',
            'answers.*.existing_image' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $bankSoal, $data) {
            $detail = $bankSoal->detail()->create([
                'kategori_id' => $data['kategori_id'],
                'nomor' => $data['nomor'],
                'soal' => $data['soal'],
                'gambar_soal' => $this->storeImage($request->file('gambar_soal'), 'bank-soal/soal'),
            ]);

            if (!empty($data['answers'])) {
                $this->syncAnswersFromRequest($request, $detail, $data['answers']);
            }
        });

        return back()->with('success', 'Soal berhasil ditambahkan.');
    }

    public function updateDetail(Request $request, DetailBankSoal $detailBankSoal)
    {
        $data = $request->validate([
            'kategori_id' => 'required|exists:kategori,id',
            'nomor' => 'required|integer|min:1|unique:detail_bank_soal,nomor,' . $detailBankSoal->id . ',id,bank_soal_id,' . $detailBankSoal->bank_soal_id,
            'soal' => 'required|string',
            'gambar_soal' => 'nullable|image|max:2048',
            'existing_gambar_soal' => 'nullable|string',
            'answers' => 'nullable|array|min:1',
            'answers.*.id' => 'nullable|integer|exists:jawaban_bank_soal,id',
            'answers.*.opsi' => 'required_with:answers|in:A,B,C,D',
            'answers.*.jawaban' => 'required_with:answers|string',
            'answers.*.nilai' => 'required_with:answers|integer|min:0',
            'answers.*.is_correct' => 'required_with:answers|boolean',
            'answers.*.gambar_jawaban' => 'nullable|image|max:2048',
            'answers.*.existing_image' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $detailBankSoal, $data) {
            $payload = [
                'kategori_id' => $data['kategori_id'],
                'nomor' => $data['nomor'],
                'soal' => $data['soal'],
            ];

            if ($request->hasFile('gambar_soal')) {
                $this->deleteImage($detailBankSoal->gambar_soal);
                $payload['gambar_soal'] = $this->storeImage($request->file('gambar_soal'), 'bank-soal/soal');
            } elseif (!empty($data['existing_gambar_soal'])) {
                $payload['gambar_soal'] = $data['existing_gambar_soal'];
            }

            $detailBankSoal->update($payload);

            if (!empty($data['answers'])) {
                $this->syncAnswersFromRequest($request, $detailBankSoal, $data['answers']);
            }
        });

        return back()->with('success', 'Soal berhasil diperbarui.');
    }

    public function destroyDetail(DetailBankSoal $detailBankSoal)
    {
        $detailBankSoal->load('jawaban');

        if ($detailBankSoal->gambar_soal) {
            $this->deleteImage($detailBankSoal->gambar_soal);
        }

        foreach ($detailBankSoal->jawaban as $answer) {
            if ($answer->gambar_jawaban) {
                $this->deleteImage($answer->gambar_jawaban);
            }
        }

        $detailBankSoal->jawaban()->delete();
        $detailBankSoal->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }

    public function storeAnswer(Request $request, DetailBankSoal $detailBankSoal)
    {
        $data = $request->validate([
            'opsi' => 'required|in:A,B,C,D',
            'jawaban' => 'required|string',
            'gambar_jawaban' => 'nullable|image|max:2048',
            'existing_image' => 'nullable|string',
            'nilai' => 'required|integer|min:0',
            'is_correct' => 'required|boolean',
        ]);

        $payload = [
            'opsi' => $data['opsi'],
            'jawaban' => $data['jawaban'],
            'nilai' => $data['nilai'],
            'is_correct' => $data['is_correct'],
            'gambar_jawaban' => $request->file('gambar_jawaban') ? $this->storeImage($request->file('gambar_jawaban'), 'bank-soal/jawaban') : ($data['existing_image'] ?? null),
        ];

        $detailBankSoal->jawaban()->create($payload);

        return back()->with('success', 'Jawaban berhasil ditambahkan.');
    }

    public function updateAnswer(Request $request, JawabanBankSoal $jawabanBankSoal)
    {
        $data = $request->validate([
            'opsi' => 'required|in:A,B,C,D',
            'jawaban' => 'required|string',
            'gambar_jawaban' => 'nullable|image|max:2048',
            'existing_image' => 'nullable|string',
            'nilai' => 'required|integer|min:0',
            'is_correct' => 'required|boolean',
        ]);

        $payload = [
            'opsi' => $data['opsi'],
            'jawaban' => $data['jawaban'],
            'nilai' => $data['nilai'],
            'is_correct' => $data['is_correct'],
        ];

        if ($request->hasFile('gambar_jawaban')) {
            $this->deleteImage($jawabanBankSoal->gambar_jawaban);
            $payload['gambar_jawaban'] = $this->storeImage($request->file('gambar_jawaban'), 'bank-soal/jawaban');
        } elseif (!empty($data['existing_image'])) {
            $payload['gambar_jawaban'] = $data['existing_image'];
        }

        $jawabanBankSoal->update($payload);

        return back()->with('success', 'Jawaban berhasil diperbarui.');
    }

    public function destroyAnswer(JawabanBankSoal $jawabanBankSoal)
    {
        $jawabanBankSoal->delete();

        return back()->with('success', 'Jawaban berhasil dihapus.');
    }

    protected function validateBankSoal(Request $request): array
    {
        $data = $request->validate([
            'jenis_tryout_id' => 'required|exists:jenis_tryout,id',
            'judul' => 'required|string|max:100',
            'waktu_pengerjaan' => 'required|integer|min:1',
            'status' => 'required|in:aktif,tidak_aktif',
            'kategori_config' => 'required|array|min:1',
            'kategori_config.*.kategori_id' => 'required|exists:kategori,id',
            'kategori_config.*.batas_nilai' => 'required|integer|min:0',
            'kategori_config.*.jumlah_soal' => 'required|integer|min:0',
        ]);

        $totals = collect($data['kategori_config']);

        $data['total_batas_nilai'] = $totals->sum('batas_nilai');
        $data['total_soal'] = $totals->sum('jumlah_soal');

        return $data;
    }

    protected function syncKategoriKonfigurasi(BankSoal $bankSoal, array $konfigurasi): void
    {
        $bankSoal->kategoriKonfigurasi()->delete();

        $payload = collect($konfigurasi)
            ->map(function ($config) {
                return [
                    'kategori_id' => $config['kategori_id'],
                    'batas_nilai' => $config['batas_nilai'],
                    'jumlah_soal' => $config['jumlah_soal'],
                ];
            })
            ->toArray();

        if (!empty($payload)) {
            $bankSoal->kategoriKonfigurasi()->createMany($payload);
        }
    }

    protected function storeImage(?UploadedFile $file, string $directory = 'bank-soal'): ?string
    {
        if (!$file) {
            return null;
        }

        $relativeDirectory = trim($directory, '/');
        $destinationPath = public_path($relativeDirectory);

        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }

        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $file->move($destinationPath, $filename);

        return $relativeDirectory . '/' . $filename;
    }

    protected function deleteImage(?string $path): void
    {
        if (!$path) {
            return;
        }

        $relativePath = ltrim($path, '/');
        $fullPath = public_path($relativePath);

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    protected function syncAnswersFromRequest(Request $request, DetailBankSoal $detail, array $answers): void
    {
        $incomingIds = collect($answers)->pluck('id')->filter()->all();

        if (!empty($incomingIds)) {
            $detail->jawaban()->whereNotIn('id', $incomingIds)->delete();
        } else {
            $detail->jawaban()->delete();
        }

        foreach ($answers as $index => $answerData) {
            $payload = [
                'opsi' => $answerData['opsi'],
                'jawaban' => $answerData['jawaban'],
                'nilai' => $answerData['nilai'],
                'is_correct' => (bool) $answerData['is_correct'],
            ];

            $file = $request->file("answers.$index.gambar_jawaban");

            if ($file instanceof UploadedFile) {
                $payload['gambar_jawaban'] = $this->storeImage($file, 'bank-soal/jawaban');
            } elseif (!empty($answerData['existing_image'])) {
                $payload['gambar_jawaban'] = $answerData['existing_image'];
            }

            if (!empty($answerData['id'])) {
                $jawaban = $detail->jawaban()->find($answerData['id']);
                if ($jawaban) {
                    if ($file instanceof UploadedFile && $jawaban->gambar_jawaban) {
                        $this->deleteImage($jawaban->gambar_jawaban);
                    }
                    $jawaban->update($payload);
                    continue;
                }
            }

            $detail->jawaban()->create($payload);
        }
    }
}
