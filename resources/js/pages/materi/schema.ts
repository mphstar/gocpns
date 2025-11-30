import { z } from 'zod';

export const materiSchema = z.object({
    name: z.string().min(3, { message: 'Minimal 3 karakter' }).max(255, { message: 'Maksimal 255 karakter' }),
    file: z.instanceof(File).optional().or(z.null()),
});

export type MateriFormValues = z.infer<typeof materiSchema>;
