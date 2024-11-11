import { useFormContext } from 'react-hook-form';

import { useToastContext } from '@/components/toast/toast-context';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { Button } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

export function SendFormButton() {
  const { displayToast } = useToastContext();
  const { schema } = useSendFormContext();
  const {
    formState: { isDirty, isValid },
    handleSubmit,
  } = useFormContext<z.infer<typeof schema>>();

  function onSubmit(data: z.infer<typeof schema>) {
    // Temporary toast for testing
    displayToast({
      title: t`Form submitted`,
      type: 'success',
    });
    // eslint-disable-next-line no-console
    console.log(t`submit data:`, data);
  }

  return (
    <Button
      mt="3"
      buttonState={isDirty && isValid ? 'default' : 'disabled'}
      onPress={handleSubmit(onSubmit)}
      title={t({
        id: 'send_form.review_button',
        message: 'Review',
      })}
    />
  );
}
