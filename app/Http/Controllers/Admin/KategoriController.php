<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPagination;
use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class KategoriController extends Controller
{
    use HandlesPagination;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $search = trim((string) $request->input('search', ''));

        $records = Kategori::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('kategori', 'like', "%{$search}%")
                        ->orWhere('kepanjangan', 'like', "%{$search}%");
                });
            })
            ->orderBy('kategori')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('kategori/view', [
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
            'kategori' => 'required|string|max:100|unique:kategori,kategori',
            'kepanjangan' => 'required|string|max:255',
        ]);

        Kategori::create($data);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Kategori $kategori)
    {
        $data = $request->validate([
            'kategori' => 'required|string|max:100|unique:kategori,kategori,' . $kategori->id,
            'kepanjangan' => 'required|string|max:255',
        ]);

        $kategori->update($data);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Kategori $kategori)
    {
        try {
            $kategori->delete();
        } catch (\Throwable $throwable) {
            throw ValidationException::withMessages([
                'error' => 'Kategori tidak dapat dihapus karena sedang digunakan.',
            ]);
        }

        return back()->with('success', 'Kategori berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:kategori,id',
        ]);

        try {
            DB::transaction(function () use ($data) {
                Kategori::whereIn('id', $data['ids'])->delete();
            });
        } catch (\Throwable $throwable) {
            throw ValidationException::withMessages([
                'error' => 'Beberapa kategori tidak dapat dihapus karena sedang digunakan.',
            ]);
        }

        return back()->with('success', 'Kategori terpilih berhasil dihapus.');
    }
}
