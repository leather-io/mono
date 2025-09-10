import { useFormContext } from 'react-hook-form';

import z from 'zod';

export const supportFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(40, 'Message must be at least 40 characters'),
});

export type SupportFormData = z.infer<typeof supportFormSchema>;

export function useSupportForm() {
  return useFormContext<SupportFormData>();
}
