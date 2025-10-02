import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  FrontSupportMessageData,
  frontSupportMessageSchema,
} from '~/utils/support/front-app-integration';

import { ScamWarning } from './scam-warning';
import { SupportForm } from './support-form';
import { SupportFormSuccess } from './support-form-success';

interface SupportFormProviderProps {
  onSuccess?: () => void;
}
export function SupportFormProvider({ onSuccess }: SupportFormProviderProps = {}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<FrontSupportMessageData>({
    mode: 'onChange',
    resolver: zodResolver(frontSupportMessageSchema),
  });

  function handleSuccess() {
    setIsSubmitted(true);
    onSuccess?.();
  }

  if (isSubmitted) {
    return (
      <>
        <ScamWarning />
        <SupportFormSuccess />
      </>
    );
  }

  return (
    <FormProvider {...form}>
      <ScamWarning />
      <SupportForm onSuccess={handleSuccess} />
    </FormProvider>
  );
}
