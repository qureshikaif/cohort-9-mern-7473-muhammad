import { z } from 'zod';

export const exportQuerySchema = z.object({
  format: z.enum(['json', 'md', 'txt', 'html']).default('json'),
});

const importedNote = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100000).default(''),
});

export const importSchema = z.object({
  notes: z
    .array(importedNote)
    .min(1, 'The file contains no notes')
    .max(500, 'Import at most 500 notes at a time'),
});

export type ImportInput = z.infer<typeof importSchema>;
