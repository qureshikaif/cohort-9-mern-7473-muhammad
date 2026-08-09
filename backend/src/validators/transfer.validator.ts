import { z } from 'zod';

// Deliberately lenient about extra keys: an export from a newer version should
// still import here, minus whatever this version does not understand.
const importedNote = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000).default(''),
});

export const importSchema = z.object({
  notes: z
    .array(importedNote)
    .min(1, 'The file contains no notes')
    .max(500, 'Import at most 500 notes at a time'),
});

export type ImportInput = z.infer<typeof importSchema>;
