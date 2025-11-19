<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPagination;
use App\Http\Controllers\Controller;
use App\Models\JenisTryout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class JenisTryoutController extends Controller
{
    use HandlesPagination;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $search = trim((string) $request->input('search', ''));

        $records = JenisTryout::query()
            ->withCount('bankSoal')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('nama', 'like', "%{$search}%")
                        ->orWhere('kode', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('jenis-tryout/view', [
            'records' => $this->inertiaPagination($records),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'kode' => 'required|string|max:20|unique:jenis_tryout,kode',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        JenisTryout::create($data);

        return back()->with('success', 'Jenis tryout berhasil ditambahkan.');
    }

    public function update(Request $request, JenisTryout $jenisTryout)
    {
        $data = $request->validate([
            'kode' => 'required|string|max:20|unique:jenis_tryout,kode,' . $jenisTryout->id,
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
        ]);

        $jenisTryout->update($data);

        return back()->with('success', 'Jenis tryout berhasil diperbarui.');
    }

    public function destroy(JenisTryout $jenisTryout)
    {
        try {
            $jenisTryout->delete();
        } catch (\Throwable $throwable) {
            throw ValidationException::withMessages([
                'error' => 'Jenis tryout tidak dapat dihapus karena sedang digunakan.',
            ]);
        }

        return back()->with('success', 'Jenis tryout berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:jenis_tryout,id',
        ]);

        try {
            DB::transaction(function () use ($data) {
                JenisTryout::whereIn('id', $data['ids'])->delete();
            });
        } catch (\Throwable $throwable) {
            throw ValidationException::withMessages([
                'error' => 'Beberapa jenis tryout tidak dapat dihapus karena sedang digunakan.',
            ]);
        }

        return back()->with('success', 'Jenis tryout terpilih berhasil dihapus.');
    }
}
