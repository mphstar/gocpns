import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import useBankSoalStore from './store';
import BankSoalFormDialog from './form';
import { columns } from './columns';
import type { BankSoalPageProps, BankSoalRecord } from './types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Bank Soal', href: '/admin/bank-soal' }];

const BankSoalPage = () => {
    const store = useBankSoalStore();
    const { records, jenisTryoutOptions, kategoriOptions } = usePage().props as BankSoalPageProps;
    const data = records.data ?? [];

    const handleBulkDelete = (rows: BankSoalRecord[]) => {
        router.post(
            route('bank-soal.bulk-destroy'),
            { ids: rows.map((row) => row.id) },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast({
                        title: 'Berhasil',
                        description: 'Bank soal terpilih dihapus.',
                    }),
                onError: (errors: Record<string, string>) =>
                    toast({
                        title: 'Gagal menghapus data',
                        description: errors.error ?? 'Pastikan tidak terhubung ke tryout aktif.',
                        variant: 'destructive',
                    }),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Soal" />
            <BankSoalFormDialog jenisTryoutOptions={jenisTryoutOptions} kategoriOptions={kategoriOptions} />
            <div className="flex flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">Bank Soal</h2>
                        <p className="text-sm text-muted-foreground">Kelola daftar bank soal lengkap dengan konfigurasi kategori.</p>
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

export default BankSoalPage;
