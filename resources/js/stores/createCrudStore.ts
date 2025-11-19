import { create } from 'zustand';

export type CrudDialogMode = 'create' | 'update';

export interface CrudState<TData> {
    open: boolean;
    dialog: CrudDialogMode;
    currentRow: TData | null;
    loadingSubmit: boolean;
    setOpen: (value: boolean) => void;
    setDialog: (dialog: CrudDialogMode) => void;
    setCurrentRow: (row: TData | null) => void;
    setLoadingSubmit: (value: boolean) => void;
}

export function createCrudStore<TData>() {
    return create<CrudState<TData>>((set) => ({
        open: false,
        dialog: 'create',
        currentRow: null,
        loadingSubmit: false,
        setOpen: (value) => set({ open: value }),
        setDialog: (dialog) => set({ dialog }),
        setCurrentRow: (row) => set({ currentRow: row }),
        setLoadingSubmit: (value) => set({ loadingSubmit: value }),
    }));
}
