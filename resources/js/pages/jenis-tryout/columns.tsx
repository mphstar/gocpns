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
import useJenisTryoutStore from './store';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { JenisTryout } from './types';
import { useState } from 'react';

const handleDelete = (id: number) => {
    router.delete(route('jenis-tryout.destroy', id), {
        preserveScroll: true,
        onSuccess: () =>
            toast({
                title: 'Berhasil',
                description: 'Jenis tryout berhasil dihapus.',
            }),
        onError: (errors: Record<string, string>) =>
            toast({
                title: 'Gagal menghapus data',
                description: errors.error ?? 'Pastikan data tidak digunakan pada modul lain.',
                variant: 'destructive',
            }),
    });
};

export const columns: ColumnDef<JenisTryout>[] = [
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
        accessorKey: 'kode',
        header: ({ column }) => (
            <Button variant="ghost" className="gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Kode
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        ),
        cell: ({ cell }) => <span className="font-semibold uppercase">{cell.getValue<string>()}</span>,
    },
    {
        accessorKey: 'nama',
        header: ({ column }) => (
            <Button variant="ghost" className="gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Nama
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: 'bank_soal_count',
        header: 'Bank Soal',
        cell: ({ cell }) => <span className="text-sm text-muted-foreground">{cell.getValue<number>()} paket</span>,
    },
    {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ cell }) => {
            const value = cell.getValue<string>();
            return <span className="text-sm text-muted-foreground">{new Date(value).toLocaleDateString('id-ID')}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const store = useJenisTryoutStore();
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
                            <DropdownMenuItem
                                onSelect={() => {
                                    store.setCurrentRow(record);
                                    store.setDialog('update');
                                    (document.activeElement as HTMLElement | null)?.blur();
                                    requestAnimationFrame(() => {
                                        setTimeout(() => store.setOpen(true), 0);
                                    });
                                }}
                            >
                                Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    requestAnimationFrame(() => setDeleteOpen(true));
                                }}
                            >
                                Hapus Data
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus jenis tryout?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        handleDelete(record.id);
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
