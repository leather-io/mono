import { useFormContext } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { Button } from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

export function SendFormButton<T extends SendFormBaseContext<T>>() {
  const { displayToast } = useToastContext();
  const { formData } = useSendFormContext<T>();
  const { onInitSendTransfer, schema } = formData;
  const {
    formState: { isDirty, isValid },
    handleSubmit,
  } = useFormContext<z.infer<typeof schema>>();

  function onSubmitForm(values: z.infer<typeof schema>) {
    onInitSendTransfer(formData, values);
    // Temporary toast for testing
    displayToast({
      title: t`Form submitted`,
      type: 'success',
    });
  }

  return (
    <Button
      mt="3"
      buttonState={isDirty && isValid ? 'default' : 'disabled'}
      onPress={handleSubmit(onSubmitForm)}
      title={t({
        id: 'send_form.review_button',
        message: 'Review',
      })}
    />
  );
}
