import { z } from 'zod';

const title = z.string().trim().min(1, 'Title is required').max(200);
const content = z.string().max(100000);

export const createNoteSchema = z.object({
  title,
  content: content.default(''),
});

export const updateNoteSchema = z
  .object({
    title: title.optional(),
    content: content.optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Provide a title or content to update',
  });

export const noteIdSchema = z.object({
  id: z.string().uuid('A valid note id is required'),
});

export const listNotesSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().min(1).max(200).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesSchema>;
