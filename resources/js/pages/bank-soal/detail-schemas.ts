import { z } from 'zod';

const fileSchema = z
    .any()
    .refine(
        (value) => value === undefined || value === null || typeof value === 'string' || (typeof File !== 'undefined' && value instanceof File),
        { message: 'File harus berupa gambar yang valid' },
    )
    .optional();

export const answerSchema = z.object({
    id: z.number().optional(),
    opsi: z.enum(['A', 'B', 'C', 'D'], { required_error: 'Opsi wajib dipilih' }),
    jawaban: z
        .string({ required_error: 'Jawaban wajib diisi' })
        .min(1, { message: 'Jawaban wajib diisi' }),
    nilai: z.coerce
        .number({ required_error: 'Nilai wajib diisi', invalid_type_error: 'Nilai harus angka' })
        .min(0, { message: 'Nilai minimal 0' }),
    is_correct: z.boolean(),
    gambar_jawaban: fileSchema,
    existing_image: z.string().optional().or(z.null()),
});

export const questionSchema = z.object({
    kategori_id: z.coerce
        .number({ required_error: 'Kategori wajib dipilih', invalid_type_error: 'Kategori wajib dipilih' })
        .min(1, { message: 'Kategori wajib dipilih' }),
    nomor: z.coerce
        .number({ required_error: 'Nomor wajib diisi', invalid_type_error: 'Nomor harus angka' })
        .min(1, { message: 'Nomor minimal 1' }),
    soal: z
        .string({ required_error: 'Soal wajib diisi' })
        .min(5, { message: 'Soal minimal 5 karakter' }),
    pembahasan: z.string().optional().or(z.null()),
    pembahasan_file: fileSchema,
    existing_pembahasan_file: z.string().optional().or(z.null()),
    gambar_soal: fileSchema,
    existing_gambar_soal: z.string().optional().or(z.null()),
    answers: z.array(answerSchema).min(1, { message: 'Minimal satu jawaban diisi' }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
export type AnswerFormValues = z.infer<typeof answerSchema>;
