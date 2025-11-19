import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useKategoriStore from './store';
import KategoriFormDialog from './form';
import { columns } from './columns';
import type { KategoriPageProps, KategoriRecord } from './types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori Soal', href: '/kategori' }];

const KategoriPage = () => {
    const store = useKategoriStore();
    const { records } = usePage().props as KategoriPageProps;
    const data = records.data ?? [];

    const handleBulkDelete = (rows: KategoriRecord[]) => {
        router.post(
            route('kategori.bulk-destroy'),
            { ids: rows.map((row) => row.id) },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: 'Berhasil',
                        description: 'Kategori terpilih telah dihapus.',
                    }),
                onError: (errors: Record<string, string>) =>
                    toast({
                        title: 'Tidak dapat menghapus data',
                        description: errors.error ?? 'Kategori mungkin sedang digunakan.',
                        variant: 'destructive',
                    }),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Soal" />
            <KategoriFormDialog />
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">Kategori Soal</h2>
                        <p className="text-sm text-muted-foreground">Kelola daftar kategori untuk mengelompokkan bank soal dan materi.</p>
                    </div>
                    <Button
                        onClick={() => {
                            store.setDialog('create');
                            store.setCurrentRow(null);
                            store.setOpen(true);
                        }}
                        className="space-x-1"
                    >
                        <span>Tambah</span> <Plus size={18} />
                    </Button>
                </div>

                <DataTable columns={columns} data={data} onBulkDelete={handleBulkDelete} />
            </div>
        </AppLayout>
    );
};

export default KategoriPage;
