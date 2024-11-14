import { FormProvider, useForm } from 'react-hook-form';

import { HasChildren } from '@/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { SendFormAmountField } from './components/send-form-amount-field';
import { SendFormAsset } from './components/send-form-asset';
import { SendFormButton } from './components/send-form-button';
import { SendFormContainer } from './components/send-form-container';
import { SendFormFooterLayout } from './components/send-form-footer.layout';
import { SendFormMemo } from './components/send-form-memo';
import { SendFormNumpad } from './components/send-form-numpad';
import { SendFormRecipient } from './components/send-form-recipient';
import { useSendFormContext } from './send-form-context';

function SendForm({ ...props }: HasChildren) {
  const { defaultValues, schema } = useSendFormContext();
  const formMethods = useForm<z.infer<typeof schema>>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...formMethods}>
      <SendFormContainer {...props} />
    </FormProvider>
  );
}

SendForm.Asset = SendFormAsset;
SendForm.AmountField = SendFormAmountField;
SendForm.RecipientField = SendFormRecipient;
SendForm.Memo = SendFormMemo;
SendForm.Numpad = SendFormNumpad;
SendForm.Button = SendFormButton;
SendForm.Footer = SendFormFooterLayout;

export { SendForm };
