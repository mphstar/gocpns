import { Head, Link, usePage } from '@inertiajs/react';
import { UserNav } from './user-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ArrowLeft } from 'lucide-react';

type AnswerItem = {
    nomor?: number;
    soal?: string;
    kategori?: string | null;
    pembahasan?: string | null;
    pembahasan_file?: string | null;
    user_jawaban?: {
        opsi?: string;
        teks?: string | null;
        gambar?: string | null;
        benar?: boolean;
        nilai?: number;
    } | null;
    jawaban_benar?: {
        opsi?: string;
        teks?: string | null;
        gambar?: string | null;
    } | null;
};

const isImage = (url?: string | null) => {
    if (!url) return false;
    const normalized = url.toLowerCase();
    return normalized.startsWith('blob:') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(normalized.split('?')[0]);
};

type PageProps = {
    riwayat: {
        id: number;
        judul?: string | null;
        jenis?: string | null;
        tanggal_mulai?: string | null;
        tanggal_selesai?: string | null;
        durasi?: number | null;
        nilai?: number | null;
        batas_nilai?: number | null;
        benar?: number | null;
        salah?: number | null;
        jumlah_soal?: number | null;
    };
    kategori: Array<{ nama?: string | null; benar: number; salah: number; nilai: number; batas: number }>;
    answers: AnswerItem[];
};

const HistoryDetail = () => {
    const { riwayat, kategori, answers } = usePage<PageProps>().props;

    const perKategoriData = kategori.map((k) => ({
        name: k.nama ?? 'Kategori',
        nilai: k.nilai,
        batas: k.batas,
    }));

    const perSoalData = answers.map((a) => ({
        name: `Soal ${a.nomor ?? ''}`.trim(),
        benar: a.user_jawaban?.benar ? 1 : 0,
        nilai: a.user_jawaban?.nilai ?? 0,
    }));

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 sm:pb-0">
            <Head title="Detail Riwayat Tryout" />
            <UserNav />

            <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Detail Riwayat</h1>
                        <p className="text-sm text-muted-foreground">{riwayat.judul ?? 'Tryout'}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('app.riwayat')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Nilai</p>
                            <p className="text-2xl font-bold">
                                {riwayat.nilai ?? 0}
                                <span className="text-sm text-muted-foreground"> / {riwayat.batas_nilai ?? 0}</span>
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Benar / Salah</p>
                            <p className="text-lg font-semibold">
                                {riwayat.benar ?? 0} / {riwayat.salah ?? 0}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Durasi</p>
                            <p className="text-lg font-semibold">{riwayat.durasi ?? '-'} menit</p>
                        </div>
                        <div className="rounded-lg border p-3 space-y-1">
                            <p className="text-xs text-muted-foreground">Waktu</p>
                            <p className="text-xs text-muted-foreground">Mulai: {riwayat.tanggal_mulai ?? '-'}</p>
                            <p className="text-xs text-muted-foreground">Selesai: {riwayat.tanggal_selesai ?? '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    <Card className="w-full min-w-0">
                        <CardHeader>
                            <CardTitle>Per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {perKategoriData.length ? (
                                <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                    <ChartContainer
                                        config={{
                                            nilai: { label: 'Nilai', color: '#3b82f6' },
                                            batas: { label: 'Batas Nilai', color: '#94a3b8' },
                                        }}
                                        className="h-[260px] w-full"
                                    >
                                        <ResponsiveContainer>
                                            <BarChart data={perKategoriData} barCategoryGap="24%">
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis tickLine={false} axisLine={false} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <ChartLegend content={<ChartLegendContent />} />
                                                <Bar dataKey="batas" radius={[6, 6, 0, 0]} fill="#94a3b8" />
                                                <Bar dataKey="nilai" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Belum ada ringkasan kategori.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="w-full min-w-0">
                        <CardHeader>
                            <CardTitle>Per Soal</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {perSoalData.length ? (
                                <div className="-mx-2 min-w-[320px] px-2 sm:mx-0">
                                    <ChartContainer
                                        config={{
                                            benar: { label: 'Benar/Salah', color: '#3b82f6' },
                                        }}
                                        className="h-[240px] w-full"
                                    >
                                        <ResponsiveContainer>
                                            <LineChart data={perSoalData}>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                                <YAxis allowDecimals={false} domain={[0, 1]} tickLine={false} axisLine={false} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="benar" stroke="#3b82f6" strokeWidth={2} dot />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Belum ada data soal.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Jawaban</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {answers.map((ans, idx) => (
                            <div key={`${ans.nomor ?? idx}`} className="rounded-lg border p-3 space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Badge
                                        variant={ans.user_jawaban?.benar ? 'secondary' : 'destructive'}
                                        className={ans.user_jawaban?.benar ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                                    >
                                        {ans.user_jawaban?.benar ? 'Benar' : 'Salah'}
                                    </Badge>
                                    {ans.kategori && <Badge variant="outline">{ans.kategori}</Badge>}
                                    <span className="text-muted-foreground text-xs">Soal {ans.nomor ?? '-'}</span>
                                </div>
                                <p className="text-sm">{ans.soal}</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="font-semibold">Jawabanmu: {ans.user_jawaban?.opsi}</p>
                                        <p className="text-muted-foreground">{ans.user_jawaban?.teks ?? '-'}</p>
                                        {ans.user_jawaban?.gambar && (
                                            <img src={ans.user_jawaban.gambar} alt="jawaban" className="h-20 rounded-md border object-contain" />
                                        )}
                                    </div>
                                    {ans.jawaban_benar && (
                                        <div className="space-y-1">
                                            <p className="font-semibold text-emerald-600">Jawaban Benar: {ans.jawaban_benar.opsi}</p>
                                            <p className="text-muted-foreground">{ans.jawaban_benar.teks ?? '-'}</p>
                                            {ans.jawaban_benar.gambar && (
                                                <img src={ans.jawaban_benar.gambar} alt="benar" className="h-20 rounded-md border object-contain" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(ans.pembahasan || ans.pembahasan_file) && (
                                    <div className="rounded-md bg-muted/30 p-3 text-sm space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pembahasan</p>
                                        {ans.pembahasan && <p className="whitespace-pre-line">{ans.pembahasan}</p>}
                                        {ans.pembahasan_file && isImage(ans.pembahasan_file) && (
                                            <img
                                                src={ans.pembahasan_file}
                                                alt="Pembahasan"
                                                className="mt-2 max-h-48 w-full rounded-md border object-contain"
                                            />
                                        )}
                                        {ans.pembahasan_file && !isImage(ans.pembahasan_file) && (
                                            <a href={ans.pembahasan_file} target="_blank" rel="noreferrer" className="text-primary underline">
                                                Lihat berkas pembahasan
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {answers.length === 0 && <p className="text-sm text-muted-foreground">Belum ada jawaban terekam.</p>}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default HistoryDetail;
