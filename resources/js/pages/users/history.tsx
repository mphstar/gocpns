import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UserNav } from './user-nav';
import { Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
    filters?: {
        limit?: number;
        from?: string | null;
        to?: string | null;
    };
    analysis?: {
        tryouts: Array<{ id: number; judul?: string | null; tanggal?: string | null; benar: number; salah: number; total_nilai: number; total_batas_nilai: number }>;
        kategori: Array<{ nama?: string | null; benar: number; salah: number; nilai: number; batas_nilai: number }>;
        per_tryout: {
            judul?: string | null;
            attempts: Array<{ name: string; nilai: number; batas: number; benar: number; salah: number; tanggal?: string | null }>;
        };
    };
    tryoutOptions?: Array<{ id: number; judul: string }>;
    selectedTryoutId?: number | null;
};

const History = () => {
    const { riwayat, filters, analysis, tryoutOptions = [], selectedTryoutId } = usePage<PageProps>().props;
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');
    const [limit, setLimit] = useState(String(filters?.limit ?? 10));
    const [selectedTryout, setSelectedTryout] = useState<string>(selectedTryoutId ? String(selectedTryoutId) : 'all');

    useEffect(() => {
        setFrom(filters?.from ?? '');
        setTo(filters?.to ?? '');
        setLimit(String(filters?.limit ?? 10));
        setSelectedTryout(selectedTryoutId ? String(selectedTryoutId) : 'all');
    }, [filters, selectedTryoutId]);

    const goToPage = (page: number) => {
        router.get(
            route('app.riwayat'),
            {
                page,
                from: from || undefined,
                to: to || undefined,
                limit,
                tryout_id: selectedTryout !== 'all' ? selectedTryout : undefined,
            },
            { preserveScroll: true, replace: true },
        );
    };

    const applyFilters = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(
            route('app.riwayat'),
            {
                from: from || undefined,
                to: to || undefined,
                limit,
                tryout_id: selectedTryout !== 'all' ? selectedTryout : undefined,
            },
            {
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const pieStyle = (benar: number, salah: number) => {
        const total = Math.max(1, benar + salah);
        const benarPct = Math.round((benar / total) * 100);
        return {
            background: `conic-gradient(#22c55e 0% ${benarPct}%, #ef4444 ${benarPct}% 100%)`,
        };
    };

    const nilaiBarWidth = (nilai: number, batas: number) => {
        if (batas <= 0) return 0;
        return Math.min(100, Math.round((nilai / batas) * 100));
    };

    const tryoutChartData = useMemo(() => {
        return (
            analysis?.tryouts?.map((t) => ({
                name: t.judul ?? 'Tryout',
                benar: t.benar,
                salah: t.salah,
                nilai: t.total_nilai,
            })) ?? []
        );
    }, [analysis?.tryouts]);

    const kategoriChartData = useMemo(() => {
        return (
            analysis?.kategori?.map((k) => ({
                name: k.nama ?? 'Kategori',
                benar: k.benar,
                salah: k.salah,
                nilai: k.nilai,
            })) ?? []
        );
    }, [analysis?.kategori]);

    const trendLine = useMemo(() => {
        if (!analysis?.tryouts?.length) return '';
        const values = analysis.tryouts.map((t) => Math.max(0, t.total_nilai));
        const max = Math.max(...values, 1);
        const width = 220;
        const height = 70;
        const step = values.length > 1 ? width / (values.length - 1) : width;
        return values
            .map((v, idx) => {
                const x = idx * step;
                const y = height - (v / max) * height;
                return `${x},${y}`;
            })
            .join(' ');
    }, [analysis?.tryouts]);

    const trendPoints = useMemo(() => {
        if (!analysis?.tryouts?.length) return [];
        const values = analysis.tryouts.map((t) => Math.max(0, t.total_nilai));
        const max = Math.max(...values, 1);
        const width = 220;
        const height = 70;
        const step = values.length > 1 ? width / (values.length - 1) : width;
        return values.map((v, idx) => {
            const x = idx * step;
            const y = height - (v / max) * height;
            return { x, y, label: analysis.tryouts[idx].judul ?? 'Tryout' };
        });
    }, [analysis?.tryouts]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
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

                <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-3">
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" />
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[160px]" />
                    <Select value={selectedTryout} onValueChange={setSelectedTryout}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Pilih Tryout" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tryout</SelectItem>
                            {tryoutOptions.map((opt) => (
                                <SelectItem key={opt.id} value={String(opt.id)}>
                                    {opt.judul}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={limit} onValueChange={setLimit}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Limit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="outline" size="sm">
                        Terapkan
                    </Button>
                </form>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Riwayat</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {riwayat.data.map((item) => (
                            <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-base font-semibold">{item.bank_soal ?? 'Tryout'}</p>
                                        <Badge variant="secondary" className="text-xs">
                                            {item.jumlah_soal} soal
                                        </Badge>
                                        {typeof item.jumlah_benar === 'number' && typeof item.jumlah_salah === 'number' && (
                                            <Badge variant="outline" className="text-xs">
                                                Benar {item.jumlah_benar} · Salah {item.jumlah_salah}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {item.tanggal_selesai && <span>{item.tanggal_selesai}</span>}
                                        <span>
                                            Nilai {item.total_nilai}/{item.total_batas_nilai}
                                        </span>
                                        <span>Durasi {item.durasi ?? '-'} menit</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href={route('app.riwayat.show', item.id)}>
                                        <Button size="sm">Lihat Detail</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {riwayat.data.length === 0 && <p className="text-sm text-muted-foreground">Belum ada riwayat tryout.</p>}
                        {(riwayat.prev_page_url || riwayat.next_page_url) && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-sm text-muted-foreground">
                                <span>
                                    Halaman {riwayat.current_page} / {riwayat.last_page}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!riwayat.prev_page_url}
                                        onClick={() => riwayat.current_page > 1 && goToPage(riwayat.current_page - 1)}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={!riwayat.next_page_url}
                                        onClick={() => riwayat.current_page < riwayat.last_page && goToPage(riwayat.current_page + 1)}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Riwayat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {riwayat.data.length > 0 ? (
                            <ChartContainer
                                config={{
                                    nilai: { label: 'Nilai', color: '#3b82f6' },
                                    batas: { label: 'Batas Nilai', color: '#94a3b8' },
                                    benar: { label: 'Benar', color: '#22c55e' },
                                    salah: { label: 'Salah', color: '#ef4444' },
                                }}
                                className="h-[320px] w-full"
                            >
                                <ResponsiveContainer>
                                    <BarChart
                                        data={riwayat.data.map((item) => ({
                                            name: item.bank_soal ?? 'Tryout',
                                            nilai: item.total_nilai,
                                            batas: item.total_batas_nilai,
                                            benar: item.jumlah_benar ?? 0,
                                            salah: item.jumlah_salah ?? 0,
                                        }))}
                                        barCategoryGap="12%"
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar dataKey="batas" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="nilai" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="benar" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="salah" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada riwayat tryout.</p>
                        )}
                    </CardContent>
                </Card>

                {analysis && (
                    <div className="grid gap-4">
                        <Card className="w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Perbandingan Tryout</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {tryoutChartData.length ? (
                                    <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                        <ChartContainer
                                            config={{
                                                benar: { label: 'Benar', color: '#22c55e' },
                                                salah: { label: 'Salah', color: '#ef4444' },
                                            }}
                                            className="h-[280px] w-full min-w-[320px]"
                                        >
                                            <ResponsiveContainer>
                                                <BarChart data={tryoutChartData} barCategoryGap="20%">
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                    <YAxis tickLine={false} axisLine={false} />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    <Bar dataKey="benar" stackId="a" radius={[6, 6, 0, 0]} fill="#22c55e" />
                                                    <Bar dataKey="salah" stackId="a" radius={[6, 6, 0, 0]} fill="#ef4444" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Belum ada data tryout.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Per Tryout (Histori Percobaan)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.per_tryout && analysis.per_tryout.attempts?.length ? (
                                    <div className="space-y-2 w-full min-w-0 overflow-x-auto">
                                        <div className="flex items-center justify-between text-sm px-1 sm:px-0">
                                            <span className="font-semibold">{analysis.per_tryout.judul ?? 'Tryout'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Total {analysis.per_tryout.attempts.length} percobaan
                                            </span>
                                        </div>
                                        <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                            <ChartContainer
                                                config={{
                                                    nilai: { label: 'Nilai', color: '#3b82f6' },
                                                    benar: { label: 'Benar', color: '#22c55e' },
                                                    salah: { label: 'Salah', color: '#ef4444' },
                                                }}
                                                className="h-[240px] w-full"
                                            >
                                                <ResponsiveContainer>
                                                    <BarChart data={analysis.per_tryout.attempts}>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                        <YAxis tickLine={false} axisLine={false} />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <ChartLegend content={<ChartLegendContent />} />
                                                        <Bar dataKey="nilai" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                                                        <Bar dataKey="benar" radius={[6, 6, 0, 0]} fill="#22c55e" />
                                                        <Bar dataKey="salah" radius={[6, 6, 0, 0]} fill="#ef4444" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Belum ada data percobaan per tryout.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Per Kategori</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {kategoriChartData.length ? (
                                    <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                        <ChartContainer
                                            config={{
                                                benar: { label: 'Benar', color: '#22c55e' },
                                                salah: { label: 'Salah', color: '#ef4444' },
                                            }}
                                            className="h-[280px] w-full min-w-[320px]"
                                        >
                                            <ResponsiveContainer>
                                                <BarChart data={kategoriChartData} barCategoryGap="20%">
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                    <YAxis tickLine={false} axisLine={false} />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    <Bar dataKey="benar" radius={[6, 6, 0, 0]} fill="#22c55e" />
                                                    <Bar dataKey="salah" radius={[6, 6, 0, 0]} fill="#ef4444" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Belum ada data kategori.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="w-full min-w-0">
                            <CardHeader>
                                <CardTitle>Tren Nilai Tryout</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {analysis.tryouts.length > 1 ? (
                                    <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                        <ChartContainer
                                            config={{ nilai: { label: 'Nilai', color: '#3b82f6' } }}
                                            className="h-[260px] w-full min-w-[320px]"
                                        >
                                            <ResponsiveContainer>
                                                <LineChart data={analysis.tryouts.map((t) => ({ name: t.judul ?? 'Tryout', nilai: t.total_nilai }))}>
                                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                    <YAxis tickLine={false} axisLine={false} />
                                                    <ChartTooltip content={<ChartTooltipContent />} />
                                                    <Line type="monotone" dataKey="nilai" stroke="#3b82f6" strokeWidth={2} dot />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Data tren membutuhkan minimal 2 tryout.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;
