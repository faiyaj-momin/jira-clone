import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  workspaceId: z.string().trim().min(1, 'Required'),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((val) => (val.trim() === '' ? undefined : val)),
    ])
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Minimum 1 character'),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((val) => (val.trim() === '' ? undefined : val)),
    ])
    .optional(),
});
