import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { BankSoalDetailPageProps, DetailBankSoalRecord } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const BankSoalDetailPage = () => {
    const { bankSoal, questions } = usePage().props as BankSoalDetailPageProps;
    const [questionToDelete, setQuestionToDelete] = useState<DetailBankSoalRecord | null>(null);

    const deleteQuestion = () => {
        if (!questionToDelete) return;
        router.delete(route('bank-soal.detail.destroy', questionToDelete.id), {
            preserveScroll: true,
            onSuccess: () => toast({ title: 'Berhasil', description: 'Soal dihapus.' }),
            onError: (errors: Record<string, string>) =>
                toast({
                    title: 'Gagal menghapus soal',
                    description: errors.error ?? 'Coba lagi beberapa saat.',
                    variant: 'destructive',
                }),
            onFinish: () => setQuestionToDelete(null),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bank Soal', href: '/bank-soal' },
        { title: bankSoal.judul, href: `/bank-soal/${bankSoal.id}/detail` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelola Soal - ${bankSoal.judul}`} />

            <div className="flex flex-col gap-4">
                <Card>
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-xl">{bankSoal.judul}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Jenis: {bankSoal.jenis_tryout?.nama ?? '-'} &middot; Status:{' '}
                                <Badge variant={bankSoal.status === 'aktif' ? 'default' : 'outline'}>{bankSoal.status}</Badge>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/bank-soal">Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={route('bank-soal.detail.create', bankSoal.id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Soal
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Jumlah Soal</p>
                            <p className="text-2xl font-semibold">{questions.length}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Batas Nilai Maks</p>
                            <p className="text-2xl font-semibold">{bankSoal.total_batas_nilai}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Durasi Pengerjaan</p>
                            <p className="text-2xl font-semibold">{bankSoal.waktu_pengerjaan} menit</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Konfigurasi Kategori</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        {bankSoal.kategori_konfigurasi.map((config) => (
                            <div key={config.id} className="rounded-lg border px-4 py-2 text-sm">
                                <p className="font-semibold">{config.kategori?.kategori ?? '-'}</p>
                                <p className="text-muted-foreground">Batas nilai {config.batas_nilai}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Daftar Soal</h3>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('bank-soal.detail.create', bankSoal.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Soal
                        </Link>
                    </Button>
                </div>

                {questions.length === 0 && (
                    <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                        Belum ada soal. Klik &quot;Tambah Soal&quot; untuk menambahkan soal baru.
                    </div>
                )}

                <div className="space-y-4">
                    {questions.map((question) => (
                        <div key={question.id} className="rounded-xl border bg-background p-4 space-y-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">Soal #{question.nomor}</Badge>
                                        {question.kategori && (
                                            <Badge variant="outline">
                                                {question.kategori.kategori} — {question.kategori.kepanjangan}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="whitespace-pre-line text-sm">{question.soal}</p>
                                    {question.gambar_soal && (
                                        <a
                                            href={`/${question.gambar_soal}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-primary underline"
                                        >
                                            Lihat gambar soal
                                        </a>
                                    )}
                                </div>
                                <div className="flex gap-2 self-start md:self-auto">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route('bank-soal.detail.edit', [bankSoal.id, question.id])}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Ubah
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setQuestionToDelete(question)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Jawaban</p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {question.jawaban.map((answer) => (
                                        <div key={answer.id} className="rounded-md border bg-background p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={answer.is_correct ? 'default' : 'secondary'}>
                                                    {answer.opsi} · {answer.nilai} poin {answer.is_correct && '(Benar)'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm whitespace-pre-line">{answer.jawaban}</p>
                                            {answer.gambar_jawaban && (
                                                <a
                                                    href={`/${answer.gambar_jawaban}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-primary underline"
                                                >
                                                    Lihat gambar jawaban
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AlertDialog open={questionToDelete !== null} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
                        <AlertDialogDescription>Soal dan seluruh jawaban terkait akan dihapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteQuestion}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
};

export default BankSoalDetailPage;


