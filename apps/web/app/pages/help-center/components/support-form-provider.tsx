import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { SupportFormError } from '~/pages/help-center/components/support-form-error';
import {
  FrontSupportMessageData,
  frontSupportMessageSchema,
} from '~/utils/support/front-app-integration';

import { ScamWarning } from './scam-warning';
import { SupportForm } from './support-form';
import { SupportFormSuccess } from './support-form-success';

export function SupportFormProvider() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  const form = useForm<FrontSupportMessageData>({
    mode: 'onChange',
    resolver: zodResolver(frontSupportMessageSchema),
  });

  function handleSuccess() {
    setIsSubmitted(true);
  }

  function handleError(): void {
    setIsError(true);
    setIsSubmitted(false);
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
      {isError && <SupportFormError />}
      <SupportForm onSuccess={handleSuccess} onError={handleError} />
    </FormProvider>
  );
}
