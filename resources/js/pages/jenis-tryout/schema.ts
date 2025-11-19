import { z } from 'zod';

export const jenisTryoutSchema = z.object({
    kode: z
        .string()
        .min(2, { message: 'Kode minimal 2 karakter' })
        .max(20, { message: 'Kode maksimal 20 karakter' }),
    nama: z
        .string()
        .min(3, { message: 'Nama minimal 3 karakter' })
        .max(100, { message: 'Nama maksimal 100 karakter' }),
    deskripsi: z
        .string()
        .max(500, { message: 'Deskripsi maksimal 500 karakter' })
        .optional()
        .or(z.literal('')),
});

export type JenisTryoutFormValues = z.infer<typeof jenisTryoutSchema>;
