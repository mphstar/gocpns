import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { bankSoalSchema, type BankSoalFormValues } from './schema';
import useBankSoalStore from './store';
import type { BankSoalPageProps, KategoriOption } from './types';

const defaultValues: BankSoalFormValues = {
    jenis_tryout_id: 0,
    judul: '',
    waktu_pengerjaan: 60,
    status: 'aktif',
    kategori_config: [],
};

interface BankSoalFormDialogProps {
    jenisTryoutOptions: BankSoalPageProps['jenisTryoutOptions'];
    kategoriOptions: KategoriOption[];
}

const BankSoalFormDialog = ({ jenisTryoutOptions, kategoriOptions }: BankSoalFormDialogProps) => {
    const store = useBankSoalStore();

    const form = useForm<BankSoalFormValues>({
        resolver: zodResolver(bankSoalSchema),
        defaultValues,
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: 'kategori_config',
    });

    const kategoriConfig = useWatch({
        control: form.control,
        name: 'kategori_config',
    });

    const totals = useMemo(() => {
        const totalSoal = kategoriConfig?.reduce((acc, item) => acc + Number(item?.jumlah_soal ?? 0), 0) ?? 0;
        const totalBatas = kategoriConfig?.reduce((acc, item) => acc + Number(item?.batas_nilai ?? 0), 0) ?? 0;
        return { totalSoal, totalBatas };
    }, [kategoriConfig]);

    useEffect(() => {
        if (store.open && store.dialog === 'update' && store.currentRow) {
            form.reset({
                jenis_tryout_id: store.currentRow.jenis_tryout_id,
                judul: store.currentRow.judul,
                waktu_pengerjaan: store.currentRow.waktu_pengerjaan,
                status: store.currentRow.status,
                kategori_config:
                    store.currentRow.kategori_konfigurasi?.map((config) => ({
                        kategori_id: config.kategori_id,
                        batas_nilai: config.batas_nilai,
                        jumlah_soal: config.jumlah_soal,
                    })) ?? [],
            });
        }

        if (store.open && store.dialog === 'create') {
            form.reset(defaultValues);
            if (kategoriOptions.length > 0) {
                replace([
                    {
                        kategori_id: kategoriOptions[0].id,
                        batas_nilai: 0,
                        jumlah_soal: 0,
                    },
                ]);
            }
        }

        if (!store.open) {
            form.reset(defaultValues);
            replace([]);
        }
    }, [store.open]);

    const handleClose = () => {
        store.setOpen(false);
        store.setCurrentRow(null);
        form.reset(defaultValues);
        replace([]);
    };

    const submit = form.handleSubmit((values) => {
        store.setLoadingSubmit(true);

        const payload = {
            ...values,
            kategori_config: values.kategori_config.map((config) => ({
                kategori_id: Number(config.kategori_id),
                batas_nilai: Number(config.batas_nilai),
                jumlah_soal: Number(config.jumlah_soal),
            })),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Berhasil',
                    description: `Bank soal ${store.dialog === 'create' ? 'ditambahkan' : 'diperbarui'}.`,
                });
                handleClose();
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([field, message]) => {
                    if (field.startsWith('kategori_config')) {
                        form.setError(field as any, {
                            type: 'server',
                            message,
                        });
                    } else {
                        form.setError(field as keyof BankSoalFormValues, {
                            type: 'server',
                            message,
                        });
                    }
                });
                toast({
                    title: 'Gagal menyimpan data',
                    description: 'Pastikan seluruh data telah diisi dengan benar.',
                    variant: 'destructive',
                });
            },
            onFinish: () => store.setLoadingSubmit(false),
        };

        if (store.dialog === 'create') {
            router.post(route('bank-soal.store'), payload, options);
            return;
        }

        if (!store.currentRow?.id) {
            store.setLoadingSubmit(false);
            return;
        }

        router.put(route('bank-soal.update', store.currentRow.id), payload, options);
    });

    const handleAddKategori = () => {
        if (kategoriOptions.length === 0) {
            toast({
                title: 'Kategori belum tersedia',
                description: 'Tambahkan kategori terlebih dahulu.',
                variant: 'destructive',
            });
            return;
        }

        append({
            kategori_id: kategoriOptions[0].id,
            batas_nilai: 0,
            jumlah_soal: 0,
        });
    };

    return (
        <Dialog
            open={store.open}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                } else {
                    store.setOpen(true);
                }
            }}
        >
            <DialogContent className="max-w-3xl sm:max-w-4xl p-0 sm:p-0">
                <div className="max-h-[85vh] overflow-y-auto space-y-6 p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{store.dialog === 'create' ? 'Tambah Bank Soal' : 'Ubah Bank Soal'}</DialogTitle>
                        <DialogDescription>Bank soal akan digunakan pada halaman tryout dan analitik hasil.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="bank-soal-form" className="space-y-4" onSubmit={submit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="jenis_tryout_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Tryout</FormLabel>
                                            <Select value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(Number(value))}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis tryout" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {jenisTryoutOptions.map((option) => (
                                                        <SelectItem key={option.id} value={String(option.id)}>
                                                            {option.nama}
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="aktif">Aktif</SelectItem>
                                                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="judul"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Judul Bank Soal</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Contoh: Paket Tryout SKD 2025" {...field} autoComplete="off" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="waktu_pengerjaan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Waktu Pengerjaan (menit)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h4 className="text-base font-semibold">Konfigurasi Kategori</h4>
                                        <p className="text-sm text-muted-foreground">Atur batas nilai dan jumlah soal per kategori.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddKategori}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kategori
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Belum ada konfigurasi kategori.</p>
                                )}

                                <div className="space-y-3">
                                    {fields.map((fieldItem, index) => (
                                        <div key={fieldItem.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-4">
                                            <FormField
                                                control={form.control}
                                                name={`kategori_config.${index}.kategori_id`}
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
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
                                                name={`kategori_config.${index}.jumlah_soal`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Jumlah Soal</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min={0} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`kategori_config.${index}.batas_nilai`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Batas Nilai</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min={0} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="md:col-span-4 flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 rounded-md bg-muted/40 p-3 text-sm">
                                    <Badge variant="secondary">Total Soal: {totals.totalSoal}</Badge>
                                    <Badge variant="outline">Total Batas Nilai: {totals.totalBatas}</Badge>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <DialogFooter className="sticky bottom-0 bg-background/80 pt-2 sm:-mx-6 sm:px-6">
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={store.loadingSubmit}>
                                Batal
                            </Button>
                            <Button type="submit" form="bank-soal-form" disabled={store.loadingSubmit}>
                                {store.loadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BankSoalFormDialog;
