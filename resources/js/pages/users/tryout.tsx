import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Timer } from 'lucide-react';
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
};

const Tryout = () => {
    const { tryouts, categories, selectedKategoriId } = usePage<PageProps>().props;

    const onFilterChange = (kategoriId: string) => {
        const payload = kategoriId && kategoriId !== 'all' ? { kategori_id: kategoriId } : {};
        router.get(
            route('app.tryout'),
            payload,
            {
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
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
                        onValueChange={onFilterChange}
                        value={selectedKategoriId ? String(selectedKategoriId) : 'all'}
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
                                <Button size="sm" asChild>
                                    <Link href="#">Mulai</Link>
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
        </div>
    );
};

export default Tryout;
