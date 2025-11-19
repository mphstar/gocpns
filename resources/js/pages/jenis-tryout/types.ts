import { PaginatedResponse } from '@/types/pagination';

export interface JenisTryout {
    id: number;
    kode: string;
    nama: string;
    deskripsi?: string | null;
    bank_soal_count: number;
    created_at: string;
    updated_at: string;
}

export interface JenisTryoutPageProps {
    records: PaginatedResponse<JenisTryout>;
    filters: {
        search?: string;
        per_page?: number;
    };
}
