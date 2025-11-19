import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useBankSoalStore from './store';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BankSoalRecord } from './types';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

const deleteBankSoal = (id: number) => {
    router.delete(route('bank-soal.destroy', id), {
        preserveScroll: true,
        onSuccess: () =>
            toast({
                title: 'Berhasil',
                description: 'Bank soal dihapus.',
            }),
        onError: (errors: Record<string, string>) =>
            toast({
                title: 'Gagal menghapus bank soal',
                description: errors.error ?? 'Pastikan tidak terhubung ke tryout aktif.',
                variant: 'destructive',
            }),
    });
};

export const columns: ColumnDef<BankSoalRecord>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'rowNumber',
        header: '#',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'judul',
        header: ({ column }) => (
            <Button variant="ghost" className="gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Judul
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        ),
        cell: ({ cell }) => <span className="font-semibold">{cell.getValue<string>()}</span>,
    },
    {
        accessorKey: 'jenis_tryout.nama',
        header: 'Jenis Tryout',
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.jenis_tryout?.nama ?? '-'}</span>,
    },
    {
        accessorKey: 'waktu_pengerjaan',
        header: 'Durasi',
        cell: ({ cell }) => <span className="text-sm">{cell.getValue<number>()} menit</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ cell }) => <Badge variant={cell.getValue<string>() === 'aktif' ? 'default' : 'outline'}>{cell.getValue<string>()}</Badge>,
    },
    {
        accessorKey: 'detail_count',
        header: 'Soal Tersedia',
        cell: ({ cell }) => <Badge variant="secondary">{cell.getValue<number>()} soal</Badge>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const store = useBankSoalStore();
            const [deleteOpen, setDeleteOpen] = useState(false);
            const record = row.original;

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={route('bank-soal.detail', record.id)}>Kelola Soal</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    store.setCurrentRow(record);
                                    store.setDialog('update');
                                    (document.activeElement as HTMLElement | null)?.blur();
                                    requestAnimationFrame(() => setTimeout(() => store.setOpen(true), 0));
                                }}
                            >
                                Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => requestAnimationFrame(() => setDeleteOpen(true))}>Hapus Data</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus bank soal?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        deleteBankSoal(record.id);
                                        setDeleteOpen(false);
                                    }}
                                >
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },
];
