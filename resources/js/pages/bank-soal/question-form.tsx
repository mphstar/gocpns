import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from '@/hooks/use-toast';
import type { BankSoalDetailPageProps, DetailBankSoalRecord, KategoriOption } from './types';
import { questionSchema, type QuestionFormValues } from './detail-schemas';
import { BreadcrumbItem } from '@/types';

interface QuestionFormProps {
    bankSoal: BankSoalDetailPageProps['bankSoal'];
    kategoriOptions: KategoriOption[];
    question: DetailBankSoalRecord | null;
    mode: 'create' | 'update';
    nextNomor: number;
}

const opsiList: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

const formatPreviewPath = (path?: string | null) => {
    if (!path) return null;
    return path.startsWith('/') ? path : `/${path}`;
};

const revokePreview = (url?: string | null) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

const createDefaultAnswers = () =>
    opsiList.map((opsi) => ({
        opsi,
        jawaban: '',
        nilai: 0,
        is_correct: opsi === 'A',
        gambar_jawaban: null as File | null,
        existing_image: null as string | null,
    }));

const buildInitialValues = (kategoriOptions: KategoriOption[], question: DetailBankSoalRecord | null, nextNomor: number): QuestionFormValues => {
    if (!question) {
        return {
            kategori_id: kategoriOptions[0]?.id ?? 0,
            nomor: nextNomor,
            soal: '',
            gambar_soal: null,
            existing_gambar_soal: null,
            answers: createDefaultAnswers(),
        };
    }

    const answers = createDefaultAnswers().map((defaultAnswer) => {
        const existing = question.jawaban.find((item) => item.opsi === defaultAnswer.opsi);
        if (!existing) {
            return defaultAnswer;
        }
        return {
            id: existing.id,
            opsi: existing.opsi as 'A' | 'B' | 'C' | 'D',
            jawaban: existing.jawaban,
            nilai: existing.nilai,
            is_correct: existing.is_correct,
            gambar_jawaban: null as File | null,
            existing_image: existing.gambar_jawaban ?? null,
        };
    });

    return {
        kategori_id: question.kategori_id ?? kategoriOptions[0]?.id ?? 0,
        nomor: question.nomor ?? nextNomor,
        soal: question.soal ?? '',
        gambar_soal: null,
        existing_gambar_soal: question.gambar_soal ?? null,
        answers,
    };
};

const QuestionFormPage = () => {
    const { bankSoal, kategoriOptions, question, mode, nextNomor } = usePage().props as unknown as QuestionFormProps;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bank Soal', href: '/bank-soal' },
        { title: bankSoal.judul, href: route('bank-soal.detail', bankSoal.id) },
        { title: mode === 'create' ? 'Tambah Soal' : 'Ubah Soal', href: '#' },
    ];

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema),
        defaultValues: buildInitialValues(kategoriOptions, question, nextNomor),
    });

    const [questionPreview, setQuestionPreview] = useState<string | null>(() => formatPreviewPath(question?.gambar_soal ?? null));
    const [answerPreviews, setAnswerPreviews] = useState<(string | null)[]>(() =>
        opsiList.map((opsi) => {
            const existing = question?.jawaban?.find((item) => item.opsi === opsi);
            return formatPreviewPath(existing?.gambar_jawaban ?? null);
        }),
    );

    useEffect(() => {
        form.reset(buildInitialValues(kategoriOptions, question, nextNomor));
        setQuestionPreview((prev) => {
            revokePreview(prev);
            return formatPreviewPath(question?.gambar_soal ?? null);
        });
        setAnswerPreviews((prev) => {
            prev.forEach((preview) => revokePreview(preview));
            return opsiList.map((opsi) => {
                const existing = question?.jawaban?.find((item) => item.opsi === opsi);
                return formatPreviewPath(existing?.gambar_jawaban ?? null);
            });
        });
    }, [question, kategoriOptions, nextNomor]);

    useEffect(() => {
        return () => {
            revokePreview(questionPreview);
        };
    }, [questionPreview]);

    useEffect(() => {
        return () => {
            answerPreviews.forEach((preview) => revokePreview(preview));
        };
    }, [answerPreviews]);

    const updateQuestionPreview = (file: File | null, existingPath?: string | null) => {
        setQuestionPreview((prev) => {
            revokePreview(prev);
            if (file) {
                return URL.createObjectURL(file);
            }
            return formatPreviewPath(existingPath ?? null);
        });
    };

    const updateAnswerPreview = (index: number, file: File | null, existingPath?: string | null) => {
        setAnswerPreviews((prev) => {
            const next = [...prev];
            revokePreview(next[index]);
            next[index] = file ? URL.createObjectURL(file) : formatPreviewPath(existingPath ?? null);
            return next;
        });
    };

    const answers = form.watch('answers') ?? [];

    const submit = form.handleSubmit((values) => {
        const formData = new FormData();
        formData.append('kategori_id', values.kategori_id.toString());
        formData.append('nomor', values.nomor.toString());
        formData.append('soal', values.soal);

        if (values.gambar_soal instanceof File) {
            formData.append('gambar_soal', values.gambar_soal);
        } else if (values.existing_gambar_soal) {
            formData.append('existing_gambar_soal', values.existing_gambar_soal);
        }

        values.answers.forEach((answer, index) => {
            formData.append(`answers[${index}][opsi]`, answer.opsi);
            formData.append(`answers[${index}][jawaban]`, answer.jawaban);
            formData.append(`answers[${index}][nilai]`, String(answer.nilai));
            formData.append(`answers[${index}][is_correct]`, answer.is_correct ? '1' : '0');
            if (answer.id) {
                formData.append(`answers[${index}][id]`, String(answer.id));
            }
            if (answer.gambar_jawaban instanceof File) {
                formData.append(`answers[${index}][gambar_jawaban]`, answer.gambar_jawaban);
            } else if (answer.existing_image) {
                formData.append(`answers[${index}][existing_image]`, answer.existing_image);
            }
        });

        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Berhasil',
                    description: `Soal ${mode === 'create' ? 'ditambahkan' : 'diperbarui'}.`,
                });
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([field, message]) => {
                    form.setError(field as keyof QuestionFormValues, { type: 'server', message });
                });
                toast({
                    title: 'Gagal menyimpan soal',
                    description: 'Periksa kembali data yang diinput.',
                    variant: 'destructive',
                });
            },
        };

        if (mode === 'create') {
            router.post(route('bank-soal.detail.store', bankSoal.id), formData, options);
            return;
        }

        if (!question) {
            return;
        }

        formData.append('_method', 'put');
        router.post(route('bank-soal.detail.update', question.id), formData, options);
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${mode === 'create' ? 'Tambah' : 'Ubah'} Soal - ${bankSoal.judul}`} />
            <div className="mx-auto flex w-full flex-col gap-6">
                <div className="rounded-2xl border bg-background/80 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">{mode === 'create' ? 'Tambah Soal' : 'Ubah Soal'}</h1>
                            <p className="text-sm text-muted-foreground">
                                Bank soal: {bankSoal.judul} &middot; Jenis: {bankSoal.jenis_tryout?.nama ?? '-'}
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('bank-soal.detail', bankSoal.id)}>Kembali</Link>
                        </Button>
                    </div>

                    <Form {...form}>
                        <form className="space-y-8 pt-6" onSubmit={submit}>
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="kategori_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kategori</FormLabel>
                                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih kategori" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {kategoriOptions.map((option) => (
                                                        <SelectItem key={option.id} value={String(option.id)}>
                                                            {option.kategori}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            <FormField
                                control={form.control}
                                name="nomor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Soal</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="soal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pertanyaan</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="Tulis deskripsi soal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gambar_soal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gambar Soal (opsional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                field.onChange(file);
                                                const existingPath = form.getValues('existing_gambar_soal');
                                                if (file) {
                                                    form.setValue('existing_gambar_soal', null);
                                                }
                                                updateQuestionPreview(file, file ? null : existingPath);
                                            }}
                                        />
                                    </FormControl>
                                    {questionPreview && (
                                        <img src={questionPreview} alt="Preview soal" className="mt-3 h-32 w-full max-w-xs rounded-md border object-cover" />
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-5 rounded-xl border bg-muted/30 p-5">
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">Jawaban A - D</h2>
                                <p className="text-sm text-muted-foreground">Isi semua opsi jawaban, tentukan nilai, dan tandai jawaban yang benar.</p>
                            </div>
                            <div className="grid gap-5">
                                {answers.map((answer, index) => (
                                    <div key={answer.opsi ?? index} className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <h3 className="text-base font-semibold">Jawaban {answer.opsi}</h3>
                                            <FormField
                                                control={form.control}
                                                name={`answers.${index}.is_correct`}
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">Tandai sebagai jawaban benar</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name={`answers.${index}.jawaban`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Deskripsi Jawaban</FormLabel>
                                                    <FormControl>
                                                        <Textarea rows={3} placeholder={`Jawaban ${answer.opsi}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name={`answers.${index}.nilai`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nilai</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                {...field}
                                                                onChange={(event) => field.onChange(Number(event.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`answers.${index}.gambar_jawaban`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Gambar (opsional)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(event) => {
                                                                    const file = event.target.files?.[0] ?? null;
                                                                    field.onChange(file);
                                                                    const existingPath = form.getValues(`answers.${index}.existing_image`);
                                                                    if (file) {
                                                                        form.setValue(`answers.${index}.existing_image`, null);
                                                                    }
                                                                    updateAnswerPreview(index, file, file ? null : existingPath);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        {answerPreviews[index] && (
                                                            <img
                                                                src={answerPreviews[index] ?? undefined}
                                                                alt={`Preview jawaban ${answer.opsi}`}
                                                                className="mt-3 h-24 w-full max-w-[160px] rounded-md border object-cover"
                                                            />
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('bank-soal.detail', bankSoal.id)}>Batal</Link>
                            </Button>
                            <Button type="submit">{mode === 'create' ? 'Simpan Soal' : 'Perbarui Soal'}</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    </AppLayout>
    );
};

export default QuestionFormPage;
