import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please provide a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
  remember: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
