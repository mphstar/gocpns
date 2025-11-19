import { z } from 'zod';

const fileSchema = z
    .any()
    .refine(
        (value) => value === undefined || value === null || typeof value === 'string' || (typeof File !== 'undefined' && value instanceof File),
        { message: 'File tidak valid' },
    )
    .optional();

export const answerSchema = z.object({
    id: z.number().optional(),
    opsi: z.enum(['A', 'B', 'C', 'D']),
    jawaban: z.string().min(1, { message: 'Jawaban wajib diisi' }),
    nilai: z.number().min(0, { message: 'Minimal 0' }),
    is_correct: z.boolean(),
    gambar_jawaban: fileSchema,
    existing_image: z.string().optional().or(z.null()),
});

export const questionSchema = z.object({
    kategori_id: z.number().min(1, { message: 'Kategori wajib dipilih' }),
    nomor: z.number().min(1, { message: 'Nomor minimal 1' }),
    soal: z.string().min(5, { message: 'Minimal 5 karakter' }),
    gambar_soal: fileSchema,
    existing_gambar_soal: z.string().optional().or(z.null()),
    answers: z.array(answerSchema).min(1),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
export type AnswerFormValues = z.infer<typeof answerSchema>;
