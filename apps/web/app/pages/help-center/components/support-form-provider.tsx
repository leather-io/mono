import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { SupportForm } from './support-form';
import { SupportFormData, supportFormSchema } from './support-form-schema';

export function SupportFormProvider() {
  const form = useForm<SupportFormData>({
    mode: 'onChange',
    resolver: zodResolver(supportFormSchema),
  });

  return (
    <FormProvider {...form}>
      <SupportForm />
    </FormProvider>
  );
}
