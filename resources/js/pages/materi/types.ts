import { PaginatedResponse } from '@/types/pagination';

export interface MateriRecord {
    id: number;
    name: string;
    kategori_id: number;
    file: string;
    created_at: string;
    updated_at: string;
    kategori?: {
        id: number;
        kategori: string;
        kepanjangan: string;
    };
}

export interface MateriPageProps {
    records: PaginatedResponse<MateriRecord>;
    kategoriOptions: {
        id: number;
        kategori: string;
        kepanjangan: string;
    }[];
    filters: {
        search?: string;
        per_page?: number;
    };
}
