import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useJenisTryoutStore from './store';
import FormDialog from './form';
import { columns } from './columns';
import type { JenisTryoutPageProps, JenisTryout } from './types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Jenis Tryout', href: '/admin/jenis-tryout' }];

const JenisTryoutPage = () => {
    const store = useJenisTryoutStore();
    const { records } = usePage().props as JenisTryoutPageProps;
    const data = records.data ?? [];

    const handleBulkDelete = (rows: JenisTryout[]) => {
        router.post(
            route('jenis-tryout.bulk-destroy'),
            { ids: rows.map((row) => row.id) },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: 'Berhasil',
                        description: 'Data terpilih telah dihapus.',
                    }),
                onError: (errors: Record<string, string>) =>
                    toast({
                        title: 'Gagal menghapus data',
                        description: errors.error ?? 'Pastikan data tidak digunakan pada modul lain.',
                        variant: 'destructive',
                    }),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jenis Tryout" />
            <FormDialog />
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">Jenis Tryout</h2>
                        <p className="text-sm text-muted-foreground">Kelola klasifikasi tryout untuk memisahkan bank soal dan analitik.</p>
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

export default JenisTryoutPage;
