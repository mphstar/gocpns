import { z } from 'zod';

export const kategoriKonfigurasiSchema = z.object({
    kategori_id: z.number().min(1, { message: 'Kategori wajib dipilih' }),
    batas_nilai: z.number().min(0, { message: 'Minimal 0' }),
    jumlah_soal: z.number().min(0, { message: 'Minimal 0' }),
});

export const bankSoalSchema = z.object({
    jenis_tryout_id: z.number().min(1, { message: 'Jenis tryout wajib dipilih' }),
    judul: z.string().min(3, { message: 'Minimal 3 karakter' }).max(100, { message: 'Maksimal 100 karakter' }),
    waktu_pengerjaan: z.number().min(1, { message: 'Minimal 1 menit' }),
    status: z.enum(['aktif', 'tidak_aktif']),
    kategori_config: z.array(kategoriKonfigurasiSchema).min(1, { message: 'Tambahkan minimal satu kategori' }),
});

export type BankSoalFormValues = z.infer<typeof bankSoalSchema>;
export type KategoriKonfigurasiFormValues = z.infer<typeof kategoriKonfigurasiSchema>;
