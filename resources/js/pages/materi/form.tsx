import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { materiSchema, type MateriFormValues } from './schema';
import useMateriStore from './store';
import type { MateriPageProps } from './types';

const defaultValues: MateriFormValues = {
    name: '',
    kategori_id: 0,
    file: null,
};

interface MateriFormDialogProps {
    kategoriOptions: MateriPageProps['kategoriOptions'];
}

const MateriFormDialog = ({ kategoriOptions }: MateriFormDialogProps) => {
    const store = useMateriStore();

    const form = useForm<MateriFormValues>({
        resolver: zodResolver(materiSchema),
        defaultValues,
    });

    useEffect(() => {
        if (store.open && store.dialog === 'update' && store.currentRow) {
            form.reset({
                name: store.currentRow.name,
                kategori_id: store.currentRow.kategori_id,
                file: null,
            });
        }

        if (!store.open) {
            form.reset(defaultValues);
        }
    }, [store.open]);

    const handleClose = () => {
        store.setOpen(false);
        store.setCurrentRow(null);
        form.reset(defaultValues);
    };

    const submit = form.handleSubmit((values) => {
        store.setLoadingSubmit(true);

        const payload: Record<string, unknown> = {
            name: values.name,
            kategori_id: values.kategori_id,
        };

        if (store.dialog === 'create' && !values.file) {
            form.setError('file', { message: 'File materi wajib diunggah' });
            store.setLoadingSubmit(false);
            return;
        }

        if (values.file) {
            payload.file = values.file;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Berhasil',
                    description: `Materi ${store.dialog === 'create' ? 'ditambahkan' : 'diperbarui'}.`,
                });
                handleClose();
            },
            onError: (errors: Record<string, string>) => {
                Object.entries(errors).forEach(([field, message]) => {
                    form.setError(field as keyof MateriFormValues, { type: 'server', message });
                });
                toast({
                    title: 'Gagal menyimpan materi',
                    description: 'Pastikan seluruh data sudah benar.',
                    variant: 'destructive',
                });
            },
            onFinish: () => store.setLoadingSubmit(false),
        };

        if (store.dialog === 'create') {
            router.post(route('materi.store'), payload, options);
            return;
        }

        if (!store.currentRow?.id) {
            store.setLoadingSubmit(false);
            return;
        }

        router.post(
            route('materi.update', store.currentRow.id),
            {
                ...payload,
                _method: 'put',
            },
            options,
        );
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
                    <DialogTitle>{store.dialog === 'create' ? 'Tambah Materi' : 'Ubah Materi'}</DialogTitle>
                    <DialogDescription>Materi membantu peserta memahami kategori soal tertentu.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id="materi-form" className="space-y-4" onSubmit={submit}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul Materi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Masukkan judul materi" {...field} autoComplete="off" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                            name="file"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Berkas Materi</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                field.onChange(file);
                                            }}
                                        />
                                    </FormControl>
                                    {store.dialog === 'update' && store.currentRow?.file && (
                                        <p className="text-xs text-muted-foreground">
                                            Berkas saat ini:{' '}
                                            <a href={`/${store.currentRow.file}`} className="text-primary underline" target="_blank" rel="noreferrer">
                                                Unduh
                                            </a>
                                        </p>
                                    )}
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
                    <Button type="submit" form="materi-form" disabled={store.loadingSubmit}>
                        {store.loadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MateriFormDialog;
