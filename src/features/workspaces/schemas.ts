/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((val) => (val.trim() === '' ? undefined : val)),
    ])
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, 'must be at least 1 character'),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((val) => (val.trim() === '' ? undefined : val)),
    ])
    .optional(),
});
