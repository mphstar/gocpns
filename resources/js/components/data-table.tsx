import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeadTablePagination } from '@/components/ui/head-table';
import { DataTablePagination } from '@/components/ui/pagination-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteConfirmAlert } from '@/components/ui/delete-confirm-alert';
import { Trash2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onBulkDelete?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue>({ columns, data, onBulkDelete }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: (value) => setRowSelection(value),
        state: {
            columnFilters,
            sorting,
            rowSelection,
        },
    });

    const handleBulkDelete = () => {
        if (!onBulkDelete) return;
        const rows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
        onBulkDelete(rows);
        table.resetRowSelection();
    };

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div>
            <HeadTablePagination table={table} action={<></>} />

            {selectedCount > 0 && onBulkDelete && (
                <div className="my-4 flex items-center justify-between rounded-md border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="text-sm font-semibold text-primary">{`${selectedCount} Data Dipilih`}</span>

                    <DeleteConfirmAlert onConfirm={handleBulkDelete}>
                        <Button variant="destructive" size="sm" className="gap-1">
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </Button>
                    </DeleteConfirmAlert>
                </div>
            )}

            <div className="my-4 flex w-full flex-col rounded-md border p-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}
