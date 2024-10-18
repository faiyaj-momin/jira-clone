import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be 8 charecters' }),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'name must be 3 charecters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, { message: 'Password must be 8 charecters' }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });
