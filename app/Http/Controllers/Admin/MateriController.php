<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesPagination;
use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Materi;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MateriController extends Controller
{
    use HandlesPagination;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $search = trim((string) $request->input('search', ''));

        $records = Materi::query()
            ->with('kategori:id,kategori,kepanjangan')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('kategori', function ($kategoriQuery) use ($search) {
                        $kategoriQuery->where('kategori', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('materi/view', [
            'records' => $this->inertiaPagination($records),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'kategoriOptions' => Kategori::orderBy('kategori')->get(['id', 'kategori', 'kepanjangan']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'kategori_id' => 'required|exists:kategori,id',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:5120',
        ]);

        $data['file'] = $this->storeFile($request->file('file'), $data['name']);

        Materi::create($data);

        return back()->with('success', 'Materi berhasil ditambahkan.');
    }

    public function update(Request $request, Materi $materi)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'kategori_id' => 'required|exists:kategori,id',
            'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $this->deleteFile($materi->file);
            $data['file'] = $this->storeFile($request->file('file'), $data['name']);
        }

        $materi->update($data);

        return back()->with('success', 'Materi berhasil diperbarui.');
    }

    public function destroy(Materi $materi)
    {
        $this->deleteFile($materi->file);
        $materi->delete();

        return back()->with('success', 'Materi berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:materi,id',
        ]);

        DB::transaction(function () use ($data) {
            $materi = Materi::whereIn('id', $data['ids'])->get();

            foreach ($materi as $row) {
                $this->deleteFile($row->file);
                $row->delete();
            }
        });

        return back()->with('success', 'Materi terpilih berhasil dihapus.');
    }

    protected function storeFile(UploadedFile $file, string $name): string
    {
        $fileName = Str::slug(Str::limit($name, 50, '')) . '-' . now()->timestamp . '.' . $file->getClientOriginalExtension();
        return $file->storeAs('materi', $fileName, 'public');
    }

    protected function deleteFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
