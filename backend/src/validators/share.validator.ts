import { z } from 'zod';

export const shareTokenSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{32}$/, 'That is not a valid share link'),
});

export const sharedUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().max(100000).optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: 'Provide a title or content to update',
  });

export type SharedUpdateInput = z.infer<typeof sharedUpdateSchema>;
