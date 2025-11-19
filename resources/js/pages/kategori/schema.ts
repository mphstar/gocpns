import { z } from 'zod';

export const kategoriSchema = z.object({
    kategori: z
        .string()
        .min(2, { message: 'Minimal 2 karakter' })
        .max(100, { message: 'Maksimal 100 karakter' }),
    kepanjangan: z
        .string()
        .min(3, { message: 'Minimal 3 karakter' })
        .max(255, { message: 'Maksimal 255 karakter' }),
});

export type KategoriFormValues = z.infer<typeof kategoriSchema>;
