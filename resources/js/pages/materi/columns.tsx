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
import useMateriStore from './store';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Download, MoreHorizontal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MateriRecord } from './types';
import { useState } from 'react';

const deleteMateri = (id: number) => {
    router.delete(route('materi.destroy', id), {
        preserveScroll: true,
        onSuccess: () =>
            toast({
                title: 'Berhasil',
                description: 'Materi dihapus.',
            }),
        onError: (errors: Record<string, string>) =>
            toast({
                title: 'Gagal menghapus materi',
                description: errors.error ?? 'Coba lagi beberapa saat.',
                variant: 'destructive',
            }),
    });
};

export const columns: ColumnDef<MateriRecord>[] = [
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
        accessorKey: 'name',
        header: ({ column }) => (
            <Button variant="ghost" className="gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                Judul
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        ),
        cell: ({ cell }) => <span className="font-semibold">{cell.getValue<string>()}</span>,
    },
    {
        accessorKey: 'file',
        header: 'Berkas',
        cell: ({ row }) => (
            <Button variant="outline" size="sm" asChild>
                <a href={`/${row.original.file}`} target="_blank" rel="noreferrer">
                    <Download className="mr-1 h-4 w-4" />
                    Unduh
                </a>
            </Button>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ cell }) => <span className="text-sm text-muted-foreground">{new Date(cell.getValue<string>()).toLocaleDateString('id-ID')}</span>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const store = useMateriStore();
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
                                    requestAnimationFrame(() => setTimeout(() => store.setOpen(true), 0));
                                }}
                            >
                                Ubah
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => requestAnimationFrame(() => setDeleteOpen(true))}>Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus materi?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        deleteMateri(record.id);
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
