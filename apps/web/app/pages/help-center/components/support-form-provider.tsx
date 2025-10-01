import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  FrontSupportMessageData,
  frontSupportMessageSchema,
} from '~/utils/support/front-app-integration';

import { SupportForm } from './support-form';

export function SupportFormProvider() {
  const form = useForm<FrontSupportMessageData>({
    mode: 'onChange',
    resolver: zodResolver(frontSupportMessageSchema),
  });

  return (
    <FormProvider {...form}>
      <SupportForm />
    </FormProvider>
  );
}
