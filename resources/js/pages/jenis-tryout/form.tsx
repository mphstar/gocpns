import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { jenisTryoutSchema, type JenisTryoutFormValues } from './schema';
import useJenisTryoutStore from './store';

const defaultValues: JenisTryoutFormValues = {
    kode: '',
    nama: '',
    deskripsi: '',
};

const FormDialog = () => {
    const store = useJenisTryoutStore();

    const form = useForm<JenisTryoutFormValues>({
        resolver: zodResolver(jenisTryoutSchema),
        defaultValues,
    });

    useEffect(() => {
        if (store.open && store.dialog === 'update' && store.currentRow) {
            form.reset({
                kode: store.currentRow.kode,
                nama: store.currentRow.nama,
                deskripsi: store.currentRow.deskripsi ?? '',
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
                    description: `Data jenis tryout berhasil ${store.dialog === 'create' ? 'ditambahkan' : 'diperbarui'}.`,
                });
                handleClose();
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([field, message]) => {
                    form.setError(field as keyof JenisTryoutFormValues, {
                        type: 'server',
                        message,
                    });
                });

                toast({
                    title: 'Terjadi kesalahan',
                    description: 'Mohon periksa kembali data yang Anda masukkan.',
                    variant: 'destructive',
                });
            },
            onFinish: () => store.setLoadingSubmit(false),
        };

        if (store.dialog === 'create') {
            router.post(route('jenis-tryout.store'), values, options);
            return;
        }

        if (!store.currentRow?.id) {
            store.setLoadingSubmit(false);
            return;
        }

        router.put(route('jenis-tryout.update', store.currentRow.id), values, options);
    });

    return (
        <Dialog
            open={store.open}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                } else {
                    store.setOpen(open);
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{store.dialog === 'create' ? 'Tambah Jenis Tryout' : 'Ubah Jenis Tryout'}</DialogTitle>
                    <DialogDescription>Kumpulan jenis tryout digunakan untuk mengelompokkan bank soal dan hasil analisis.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id="jenis-tryout-form" className="space-y-4" onSubmit={submit}>
                        <FormField
                            control={form.control}
                            name="kode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kode</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: SKD-1" {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan nama jenis tryout" {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="deskripsi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Catatan tambahan (opsional)" rows={4} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={handleClose} disabled={store.loadingSubmit}>
                        Batal
                    </Button>
                    <Button type="submit" form="jenis-tryout-form" disabled={store.loadingSubmit}>
                        {store.loadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;
