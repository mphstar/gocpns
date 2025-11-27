import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserNav } from './user-nav';
import { Clock, Trophy } from 'lucide-react';

type RiwayatItem = {
    id: number;
    bank_soal?: string | null;
    tanggal_selesai?: string | null;
    total_nilai: number;
    total_batas_nilai: number;
    jumlah_soal: number;
    jumlah_benar?: number;
    jumlah_salah?: number;
    durasi?: number | null;
    kategori: Array<{ nama?: string | null; nilai: number; batas_nilai: number }>;
};

type PageProps = {
    riwayat: {
        data: RiwayatItem[];
        current_page: number;
        last_page: number;
        next_page_url?: string | null;
        prev_page_url?: string | null;
    };
    categories: Array<{ id: number; kategori: string }>;
    selectedKategoriId?: number | null;
};

const History = () => {
    const { riwayat, categories, selectedKategoriId } = usePage<PageProps>().props;

    const onFilterChange = (kategoriId: string) => {
        router.get(
            route('app.riwayat'),
            kategoriId ? { kategori_id: kategoriId } : {},
            {
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Riwayat Tryout" />
            <UserNav />

            <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold">Riwayat Kuis & Tryout</h1>
                        <p className="text-sm text-muted-foreground">Pantau hasil pengerjaanmu.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/app/home">Kembali</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Select onValueChange={onFilterChange} value={selectedKategoriId ? String(selectedKategoriId) : ''}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Filter kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Semua Kategori</SelectItem>
                            {categories.map((kat) => (
                                <SelectItem key={kat.id} value={String(kat.id)}>
                                    {kat.kategori}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4">
                    {riwayat.data.map((item) => (
                        <Card key={item.id} className="transition hover:shadow-md">
                            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-base">{item.bank_soal ?? 'Tryout'}</CardTitle>
                                    {item.tanggal_selesai && (
                                        <p className="text-xs text-muted-foreground">{item.tanggal_selesai}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{item.durasi ?? '-'} menit</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        Nilai {item.total_nilai}/{item.total_batas_nilai}
                                    </Badge>
                                    <Badge variant="outline">{item.jumlah_soal} soal</Badge>
                                    {typeof item.jumlah_benar === 'number' && typeof item.jumlah_salah === 'number' && (
                                        <Badge variant="outline">
                                            Benar {item.jumlah_benar} · Salah {item.jumlah_salah}
                                        </Badge>
                                    )}
                                </div>
                                {item.kategori?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.kategori.map((kat, idx) => (
                                            <Badge key={`${kat.nama}-${idx}`} variant="outline" className="text-xs">
                                                {kat.nama}: {kat.nilai}/{kat.batas_nilai}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {riwayat.data.length === 0 && (
                        <Card>
                            <CardContent className="py-6 text-sm text-muted-foreground">Belum ada riwayat tryout.</CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
