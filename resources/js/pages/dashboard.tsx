import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Award, BookOpen, BookText, GraduationCap, School, TrendingDown, TrendingUp, UserCheck, UserPlus, Users } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

type TrendItem = { name: string; nilai: number; peserta: number };
type DistribusiItem = { name: string; benar: number; salah: number };
type PageProps = {
    stats?: {
        total_users: number;
        new_users: number;
        admin_active: number;
        bank_soal: number;
        tryout_active: number;
        materi: number;
        avg_score: number;
        study_hours: number;
        finished_tryout: number;
    };
    trend?: TrendItem[];
    kategori_distribusi?: DistribusiItem[];
};

export default function Dashboard() {
    const { stats, trend = [], kategori_distribusi = [] } = usePage<PageProps>().props;

    const adminMetrics = [
        { label: 'Total Pengguna', value: stats?.total_users ?? 0, change: `+${stats?.new_users ?? 0}`, icon: Users, trend: 'up' as const },
        { label: 'Pengguna Baru (7d)', value: stats?.new_users ?? 0, change: `+${stats?.new_users ?? 0}`, icon: UserPlus, trend: 'up' as const },
        { label: 'Admin', value: stats?.admin_active ?? 0, change: 'aktif', icon: UserCheck, trend: 'up' as const },
    ];

    const contentMetrics = [
        { label: 'Bank Soal', value: stats?.bank_soal ?? 0, change: `${stats?.tryout_active ?? 0} aktif`, icon: BookText },
        { label: 'Tryout Aktif', value: stats?.tryout_active ?? 0, change: 'status aktif', icon: GraduationCap },
        { label: 'Materi', value: stats?.materi ?? 0, change: 'total materi', icon: BookOpen },
    ];

    const userHighlights = [
        { label: 'Rata-rata Nilai Tryout', value: stats?.avg_score ?? 0, suffix: '/ 100', icon: Award, tone: 'success' as const },
        { label: 'Waktu Belajar / Minggu', value: stats?.study_hours ?? 0, suffix: ' jam', icon: School, tone: 'muted' as const },
        { label: 'Tryout Diselesaikan', value: stats?.finished_tryout ?? 0, suffix: ' sesi', icon: GraduationCap, tone: 'muted' as const },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">Ringkasan Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Gambaran singkat performa platform untuk admin dan pengguna.</p>
                </div>

                {/* Admin Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    {adminMetrics.map(({ label, value, change, icon: Icon, trend }) => (
                        <Card key={label} className="border-dashed">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{value}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {trend === 'up' ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-rose-500" />
                                    )}
                                    <span className={trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}>{change}</span>
                                    <span>vs minggu lalu</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {contentMetrics.map(({ label, value, change, icon: Icon }) => (
                        <Card key={label} className="border-dashed">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{value}</div>
                                <p className="text-xs text-muted-foreground">{change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Separator />

                {/* User-side glance */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Highlight Pengguna</CardTitle>
                                <CardDescription>Kilas performa rata-rata peserta tryout.</CardDescription>
                            </div>
                            <Badge variant="secondary">7 hari terakhir</Badge>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-3">
                            {userHighlights.map(({ label, value, suffix, icon: Icon, tone }) => (
                                <div key={label} className="rounded-lg border bg-muted/30 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </div>
                                    <p className={`mt-2 text-xl font-semibold ${tone === 'success' ? 'text-emerald-600' : ''}`}>
                                        {value}
                                        <span className="text-sm text-muted-foreground">{suffix}</span>
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Task Admin</CardTitle>
                            <CardDescription>Hal yang perlu dipantau.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Review soal baru</p>
                                    <p className="text-muted-foreground">12 soal menunggu verifikasi.</p>
                                </div>
                                <Badge variant="secondary">Prioritas</Badge>
                            </div>
                            <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Laporan pengguna</p>
                                    <p className="text-muted-foreground">3 laporan terkait konten tryout.</p>
                                </div>
                                <Badge variant="outline">Tinjau</Badge>
                            </div>
                            <div className="flex items-start justify-between gap-2 rounded-lg border p-3">
                                <div>
                                    <p className="font-medium">Backup & kesehatan sistem</p>
                                    <p className="text-muted-foreground">Terakhir: 2 jam lalu.</p>
                                </div>
                                <Badge variant="secondary">OK</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Tren Nilai & Peserta Tryout</CardTitle>
                            <CardDescription>Gambaran 6 bulan terakhir.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="-mx-2 min-w-[320px] px-2">
                                <ChartContainer
                                    config={{
                                        nilai: { label: 'Nilai Rata-rata', color: '#3b82f6' },
                                        peserta: { label: 'Peserta', color: '#22c55e' },
                                    }}
                                    className="h-[260px] w-full"
                                >
                                    <ResponsiveContainer>
                                        <LineChart data={trend}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Line type="monotone" dataKey="nilai" stroke="#3b82f6" strokeWidth={2} dot />
                                            <Line type="monotone" dataKey="peserta" stroke="#22c55e" strokeWidth={2} dot />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribusi Jawaban per Kategori</CardTitle>
                            <CardDescription>Benar vs salah dari seluruh tryout.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="-mx-2 min-w-[320px] px-2">
                                <ChartContainer
                                    config={{
                                        benar: { label: 'Benar', color: '#22c55e' },
                                        salah: { label: 'Salah', color: '#ef4444' },
                                    }}
                                    className="h-[260px] w-full"
                                >
                                    <ResponsiveContainer>
                                        <BarChart data={kategori_distribusi} barCategoryGap="20%">
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
