import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { ActivitySquare, BarChart3, CalendarRange, Clock3, UserRound } from 'lucide-react';

type UserOption = { id: number; name: string; email?: string | null };
type RiwayatItem = {
    id: number;
    judul?: string | null;
    tanggal?: string | null;
    nilai: number;
    batas: number;
    benar?: number;
    salah?: number;
    durasi?: number | null;
};

type Analysis = {
    tryouts: Array<{ id: number; name: string; nilai: number; benar: number; salah: number; batas: number; tanggal?: string | null }>;
    kategori: Array<{ name?: string | null; nilai: number; batas: number; benar: number; salah: number }>;
    per_tryout?: {
        judul?: string | null;
        attempts: Array<{ name: string; nilai: number; batas: number; benar: number; salah: number; tanggal?: string | null }>;
    } | null;
};

type PageProps = {
    users: UserOption[];
    selectedUserId?: number | null;
    riwayat: RiwayatItem[];
    analysis: Analysis;
    summary: { total: number; avg: number; best: number; duration: number; last_score?: number | null };
    filters?: { from?: string | null; to?: string | null; tryout_id?: string | number | null };
    tryoutOptions?: Array<{ id: number; judul: string }>;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Report', href: '/admin/report' }];

export default function Report() {
    const { users = [], selectedUserId, riwayat = [], analysis, summary, filters, tryoutOptions = [] } = usePage<PageProps>().props;

    const [userId, setUserId] = useState<string>(selectedUserId ? String(selectedUserId) : users[0] ? String(users[0].id) : '');
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');
    const [tryoutId, setTryoutId] = useState(filters?.tryout_id ? String(filters.tryout_id) : 'all');

    useEffect(() => {
        setUserId(selectedUserId ? String(selectedUserId) : users[0] ? String(users[0].id) : '');
        setFrom(filters?.from ?? '');
        setTo(filters?.to ?? '');
        setTryoutId(filters?.tryout_id ? String(filters.tryout_id) : 'all');
    }, [selectedUserId, filters, users]);

    const applyFilters = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userId) return;
        router.get(
            route('report'),
            {
                user_id: userId,
                from: from || undefined,
                to: to || undefined,
                tryout_id: tryoutId !== 'all' ? tryoutId : undefined,
            },
            { preserveScroll: true, replace: true },
        );
    };

    const durationHours = useMemo(() => (summary?.duration ? Math.round((summary.duration / 60) * 10) / 10 : 0), [summary?.duration]);

    const hasData = Boolean(riwayat.length || analysis?.tryouts?.length || analysis?.kategori?.length);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Report Pengguna</h1>
                        <p className="text-sm text-muted-foreground">Pantau performa tryout tiap pengguna dalam satu halaman admin.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRange className="h-4 w-4" />
                        <span>Data realtime dari hasil tryout</span>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
                    <div className="flex flex-1 flex-wrap gap-3">
                        <div className="min-w-[220px] flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Pengguna</p>
                            <Select value={userId} onValueChange={setUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih pengguna" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} {user.email ? `(${user.email})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-[200px]">
                            <p className="text-xs text-muted-foreground mb-1">Tryout</p>
                            <Select value={tryoutId} onValueChange={setTryoutId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua tryout" />
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
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Dari</p>
                            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Sampai</p>
                            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[160px]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="submit" className="w-full lg:w-auto">
                            Tampilkan
                        </Button>
                    </div>
                </form>

                {!userId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tidak ada pengguna</CardTitle>
                            <CardDescription>Tambahkan pengguna terlebih dahulu untuk melihat laporan.</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {userId && (
                    <>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card className="border-dashed">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Semua sesi tersaring</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <BarChart3 className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="text-2xl font-semibold">{summary?.avg ?? 0}</p>
                                        <p className="text-xs text-muted-foreground">Terbaik {summary?.best ?? 0}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-dashed">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Tryout yang dikerjakan</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <ActivitySquare className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="text-2xl font-semibold">{summary?.total ?? 0}</p>
                                        <p className="text-xs text-muted-foreground">Nilai terakhir {summary?.last_score ?? 0}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-dashed">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-sm font-medium">Durasi Belajar</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Akumulasi menit</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <Clock3 className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="text-2xl font-semibold">{summary?.duration ?? 0} mnt</p>
                                        <p className="text-xs text-muted-foreground">≈ {durationHours} jam</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-dashed">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-sm font-medium">Profil</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">Pengguna terpilih</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <UserRound className="h-8 w-8 text-primary" />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">
                                            {users.find((u) => String(u.id) === userId)?.name ?? '-'}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {users.find((u) => String(u.id) === userId)?.email ?? 'Email tidak tersedia'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Tren Nilai & Jawaban</CardTitle>
                                    <CardDescription>Nilai, benar, dan salah per sesi.</CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    {analysis?.tryouts?.length ? (
                                        <div className="-mx-2 min-w-[320px] px-2">
                                            <ChartContainer
                                                config={{
                                                    nilai: { label: 'Nilai', color: '#3b82f6' },
                                                    benar: { label: 'Benar', color: '#22c55e' },
                                                    salah: { label: 'Salah', color: '#ef4444' },
                                                }}
                                                className="h-[280px] w-full"
                                            >
                                                <ResponsiveContainer>
                                                    <BarChart data={analysis.tryouts} barCategoryGap="18%">
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
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Belum ada data tren.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribusi per Kategori</CardTitle>
                                    <CardDescription>Akumulasi nilai dan jawaban.</CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    {analysis?.kategori?.length ? (
                                        <div className="-mx-2 min-w-[320px] px-2">
                                            <ChartContainer
                                                config={{
                                                    nilai: { label: 'Nilai', color: '#3b82f6' },
                                                    benar: { label: 'Benar', color: '#22c55e' },
                                                    salah: { label: 'Salah', color: '#ef4444' },
                                                }}
                                                className="h-[260px] w-full"
                                            >
                                                <ResponsiveContainer>
                                                    <BarChart data={analysis.kategori} barCategoryGap="20%">
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
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Belum ada data kategori.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Percobaan per Tryout</CardTitle>
                                    <CardDescription>Bandingkan setiap percobaan di tryout terpilih.</CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    {analysis?.per_tryout?.attempts?.length ? (
                                        <div className="-mx-2 min-w-[320px] px-2">
                                            <ChartContainer
                                                config={{
                                                    nilai: { label: 'Nilai', color: '#3b82f6' },
                                                    benar: { label: 'Benar', color: '#22c55e' },
                                                    salah: { label: 'Salah', color: '#ef4444' },
                                                }}
                                                className="h-[260px] w-full"
                                            >
                                                <ResponsiveContainer>
                                                    <LineChart data={analysis.per_tryout.attempts}>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                        <YAxis tickLine={false} axisLine={false} />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <ChartLegend content={<ChartLegendContent />} />
                                                        <Line type="monotone" dataKey="nilai" stroke="#3b82f6" strokeWidth={2} dot />
                                                        <Line type="monotone" dataKey="benar" stroke="#22c55e" strokeWidth={2} dot />
                                                        <Line type="monotone" dataKey="salah" stroke="#ef4444" strokeWidth={2} dot />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Tryout: {analysis.per_tryout.judul ?? 'Tryout'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Belum ada percobaan di tryout terpilih.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Terbaru</CardTitle>
                                    <CardDescription>12 sesi terakhir pengguna ini.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {riwayat.length ? (
                                        riwayat.map((row) => (
                                            <div key={row.id} className="rounded-lg border p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-semibold truncate">{row.judul ?? 'Tryout'}</p>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {row.nilai}/{row.batas}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{row.tanggal ?? '-'}</span>
                                                    <span>Benar {row.benar ?? 0}</span>
                                                    <span>Salah {row.salah ?? 0}</span>
                                                    <span>Durasi {row.durasi ?? '-'} mnt</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Belum ada riwayat tryout.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {!hasData && (
                            <Card className="border-dashed">
                                <CardHeader>
                                    <CardTitle>Belum ada data</CardTitle>
                                    <CardDescription>Pengguna ini belum memiliki riwayat tryout sesuai filter.</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
