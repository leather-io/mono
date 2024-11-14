import { useFormContext } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { Button } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

export function SendFormButton() {
  const { displayToast } = useToastContext();
  const { schema, onInitSendTransfer } = useSendFormContext();
  const {
    formState: { isDirty, isValid },
    handleSubmit,
  } = useFormContext<z.infer<typeof schema>>();

  function onSubmitForm(values: z.infer<typeof schema>) {
    onInitSendTransfer(values);
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
