import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useMateriStore from './store';
import MateriFormDialog from './form';
import { columns } from './columns';
import type { MateriPageProps, MateriRecord } from './types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Materi', href: '/admin/materi' }];

const MateriPage = () => {
    const store = useMateriStore();
    const { records, kategoriOptions } = usePage().props as MateriPageProps;
    const data = records.data ?? [];

    const handleBulkDelete = (rows: MateriRecord[]) => {
        router.post(
            route('materi.bulk-destroy'),
            { ids: rows.map((row) => row.id) },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: 'Berhasil',
                        description: 'Materi terpilih dihapus.',
                    }),
                onError: (errors: Record<string, string>) =>
                    toast({
                        title: 'Gagal menghapus materi',
                        description: errors.error ?? 'Coba lagi beberapa saat.',
                        variant: 'destructive',
                    }),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materi" />
            <MateriFormDialog kategoriOptions={kategoriOptions} />
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">Materi</h2>
                        <p className="text-sm text-muted-foreground">Manajemen materi belajar untuk setiap kategori soal.</p>
                    </div>
                    <Button
                        onClick={() => {
                            store.setDialog('create');
                            store.setCurrentRow(null);
                            store.setOpen(true);
                        }}
                        className="space-x-1"
                    >
                        <span>Upload</span> <Plus size={18} />
                    </Button>
                </div>

                <DataTable columns={columns} data={data} onBulkDelete={handleBulkDelete} />
            </div>
        </AppLayout>
    );
};

export default MateriPage;
