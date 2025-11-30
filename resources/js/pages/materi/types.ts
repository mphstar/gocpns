import { PaginatedResponse } from '@/types/pagination';

export interface MateriRecord {
    id: number;
    name: string;
    file: string;
    created_at: string;
    updated_at: string;
}

export interface MateriPageProps {
    records: PaginatedResponse<MateriRecord>;
    filters: {
        search?: string;
        per_page?: number;
    };
}
