import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { kategoriSchema, type KategoriFormValues } from './schema';
import useKategoriStore from './store';

const defaultValues: KategoriFormValues = {
    kategori: '',
    kepanjangan: '',
};

const KategoriFormDialog = () => {
    const store = useKategoriStore();

    const form = useForm<KategoriFormValues>({
        resolver: zodResolver(kategoriSchema),
        defaultValues,
    });

    useEffect(() => {
        if (store.open && store.dialog === 'update' && store.currentRow) {
            form.reset({
                kategori: store.currentRow.kategori,
                kepanjangan: store.currentRow.kepanjangan,
            });
        }

        if (!store.open) {
            form.reset(defaultValues);
        }
    }, [store.open]);

    const handleClose = () => {
        store.setOpen(false);
        store.setCurrentRow(null);
    };

    const submit = form.handleSubmit((values) => {
        store.setLoadingSubmit(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Berhasil',
                    description: `Kategori ${store.dialog === 'create' ? 'ditambahkan' : 'diperbarui'}.`,
                });
                handleClose();
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([field, message]) => {
                    form.setError(field as keyof KategoriFormValues, { type: 'server', message });
                });
                toast({
                    title: 'Gagal menyimpan data',
                    description: 'Pastikan seluruh bidang terisi dengan benar.',
                    variant: 'destructive',
                });
            },
            onFinish: () => store.setLoadingSubmit(false),
        };

        if (store.dialog === 'create') {
            router.post(route('kategori.store'), values, options);
            return;
        }

        if (!store.currentRow?.id) {
            store.setLoadingSubmit(false);
            return;
        }

        router.put(route('kategori.update', store.currentRow.id), values, options);
    });

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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{store.dialog === 'create' ? 'Tambah Kategori' : 'Ubah Kategori'}</DialogTitle>
                    <DialogDescription>Kategori soal digunakan untuk mengelompokkan soal dan materi.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id="kategori-form" className="space-y-4" onSubmit={submit}>
                        <FormField
                            control={form.control}
                            name="kategori"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode Kategori</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: TWK" {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="kepanjangan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Panjang</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tes Wawasan Kebangsaan" {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={store.loadingSubmit}>
                        Batal
                    </Button>
                    <Button type="submit" form="kategori-form" disabled={store.loadingSubmit}>
                        {store.loadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default KategoriFormDialog;
