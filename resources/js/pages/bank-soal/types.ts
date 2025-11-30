import { PaginatedResponse } from '@/types/pagination';

export type StatusAktif = 'aktif' | 'tidak_aktif';

export interface SimpleOption {
    id: number;
    label: string;
}

export interface KategoriOption {
    id: number;
    kategori: string;
    kepanjangan: string;
}

export interface BankSoalKategoriConfig {
    id: number;
    kategori_id: number;
    batas_nilai: number;
    jumlah_soal: number;
    kategori?: KategoriOption;
}

export interface BankSoalRecord {
    id: number;
    jenis_tryout_id: number;
    judul: string;
    waktu_pengerjaan: number;
    status: StatusAktif;
    total_batas_nilai: number;
    total_soal: number;
    detail_count: number;
    created_at: string;
    updated_at: string;
    jenis_tryout: {
        id: number;
        nama: string;
    };
    kategori_konfigurasi: BankSoalKategoriConfig[];
}

export interface BankSoalPageProps {
    records: PaginatedResponse<BankSoalRecord>;
    filters: {
        search?: string;
        per_page?: number;
        jenis_tryout_id?: number | null;
        status?: StatusAktif | null;
    };
    jenisTryoutOptions: Array<{ id: number; nama: string }>;
    kategoriOptions: KategoriOption[];
}

export interface JawabanBankSoalRecord {
    id: number;
    detail_bank_soal_id: number;
    opsi: 'A' | 'B' | 'C' | 'D';
    jawaban: string;
    gambar_jawaban?: string | null;
    nilai: number;
    is_correct: boolean;
}

export interface DetailBankSoalRecord {
    id: number;
    bank_soal_id: number;
    kategori_id: number;
    nomor: number;
    soal: string;
    gambar_soal?: string | null;
    pembahasan?: string | null;
    pembahasan_file?: string | null;
    kategori?: KategoriOption;
    jawaban: JawabanBankSoalRecord[];
}

export interface BankSoalDetailPageProps {
    bankSoal: BankSoalRecord;
    questions: DetailBankSoalRecord[];
    kategoriOptions: KategoriOption[];
}
