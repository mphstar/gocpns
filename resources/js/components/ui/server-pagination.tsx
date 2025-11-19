import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginationMeta } from '@/types/pagination';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ServerPaginationProps {
    meta: PaginationMeta;
    perPage: number;
    perPageOptions?: number[];
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    isLoading?: boolean;
}

export function ServerPagination({
    meta,
    perPage,
    perPageOptions = [10, 25, 50],
    onPageChange,
    onPerPageChange,
    isLoading = false,
}: ServerPaginationProps) {
    const disablePrev = meta.current_page <= 1 || isLoading;
    const disableNext = meta.current_page >= meta.last_page || isLoading;

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tampil</span>
                <Select
                    value={String(perPage)}
                    onValueChange={(value) => onPerPageChange?.(Number(value))}
                    disabled={isLoading}
                >
                    <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                                {option} / halaman
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                    {meta.from ?? 0}-{meta.to ?? 0} dari {meta.total} data
                </span>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={disablePrev}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(meta.current_page - 1)}
                    disabled={disablePrev}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                    Halaman {meta.current_page} / {meta.last_page}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(meta.current_page + 1)}
                    disabled={disableNext}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(meta.last_page)}
                    disabled={disableNext}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
