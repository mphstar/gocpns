import { PaginatedResponse } from '@/types/pagination';

export interface KategoriRecord {
    id: number;
    kategori: string;
    kepanjangan: string;
    created_at: string;
    updated_at: string;
}

export interface KategoriPageProps {
    records: PaginatedResponse<KategoriRecord>;
    filters: {
        search?: string;
        per_page?: number;
    };
}
