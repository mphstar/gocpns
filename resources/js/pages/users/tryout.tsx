import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Target, Timer, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserNav } from './user-nav';

type TryoutItem = {
    id: number;
    judul: string;
    jenis?: string | null;
    durasi?: number | null;
    kategori: string[];
};

type PageProps = {
    tryouts: {
        data: TryoutItem[];
        current_page: number;
        last_page: number;
        next_page_url?: string | null;
        prev_page_url?: string | null;
    };
    categories: Array<{ id: number; kategori: string }>;
    selectedKategoriId?: number | null;
    jenisTryout?: Array<{ id: number; nama: string }>;
    selectedJenisId?: number | null;
    ongoing?: Record<
        number,
        {
            session_id: number;
            bank_soal_id: number;
            judul?: string | null;
        }
    >;
};

const Tryout = () => {
    const { tryouts, categories, selectedKategoriId, jenisTryout = [], selectedJenisId, ongoing = {} } = usePage<PageProps>().props;
    const [selected, setSelected] = useState<TryoutItem | null>(null);
    const [starting, setStarting] = useState(false);
    const [kategoriFilter, setKategoriFilter] = useState<string>(selectedKategoriId ? String(selectedKategoriId) : 'all');
    const [jenisFilter, setJenisFilter] = useState<string>(selectedJenisId ? String(selectedJenisId) : 'all');

    useEffect(() => {
        setKategoriFilter(selectedKategoriId ? String(selectedKategoriId) : 'all');
        setJenisFilter(selectedJenisId ? String(selectedJenisId) : 'all');
    }, [selectedKategoriId, selectedJenisId]);

    const applyFilters = (kategoriId: string, jenisId: string) => {
        setKategoriFilter(kategoriId);
        setJenisFilter(jenisId);
        router.get(
            route('app.tryout'),
            {
                kategori_id: kategoriId !== 'all' ? kategoriId : undefined,
                jenis_id: jenisId !== 'all' ? jenisId : undefined,
            },
            {
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const handleStart = () => {
        if (!selected) return;
        setStarting(true);
        router.visit(route('app.tryout.take', selected.id), {
            onFinish: () => setStarting(false),
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
            <Head title="Tryout" />
            <UserNav />

            <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                            Tryout & Latihan
                        </Badge>
                        <h1 className="text-3xl font-semibold">Siapkan diri lewat simulasi</h1>
                        <p className="text-muted-foreground">Pilih sesi tryout yang sesuai, kerjakan, dan cek skor.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/app/home">Kembali</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        onValueChange={(val) => applyFilters(val, jenisFilter)}
                        value={kategoriFilter}
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Filter kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories.map((kat) => (
                                <SelectItem key={kat.id} value={String(kat.id)}>
                                    {kat.kategori}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        onValueChange={(val) => applyFilters(kategoriFilter, val)}
                        value={jenisFilter}
                    >
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Filter tipe soal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe Soal</SelectItem>
                            {jenisTryout.map((jenis) => (
                                <SelectItem key={jenis.id} value={String(jenis.id)}>
                                    {jenis.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {tryouts.data.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="space-y-2">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-5 w-5 text-primary" />
                                        {item.judul}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">{item.jenis ?? 'Tryout'}</p>
                                    {item.kategori?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.kategori.map((kat) => (
                                                <Badge key={kat} variant="outline" className="text-xs">
                                                    {kat}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4" />
                                        <span>{item.durasi ?? '-'} menit</span>
                                    </div>
                                    <Button size="sm" onClick={() => setSelected(item)}>
                                        {ongoing[item.id] ? 'Lanjutkan' : 'Mulai'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {tryouts.data.length === 0 && (
                            <Card className="md:col-span-3">
                            <CardContent className="py-6 text-muted-foreground text-sm">Belum ada tryout tersedia.</CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <AlertDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            {selected && ongoing[selected.id] ? 'Lanjutkan Tryout' : 'Konfirmasi Mulai Tryout'}
                        </AlertDialogTitle>
                        {selected && (
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="text-foreground font-semibold">{selected.judul}</p>
                                <p>{selected.jenis ?? 'Tryout'}</p>
                                <p>Durasi: {selected.durasi ?? '-'} menit</p>
                                {selected.kategori?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selected.kategori.map((kat) => (
                                            <Badge key={kat} variant="outline" className="text-xs">
                                                {kat}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelected(null)}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStart} disabled={starting}>
                            <div className="flex items-center justify-center gap-2">
                                {starting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {selected && ongoing[selected.id] ? 'Lanjutkan' : 'Mulai Sekarang'}
                            </div>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Tryout;
