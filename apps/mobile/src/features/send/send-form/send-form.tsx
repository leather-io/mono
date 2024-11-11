import { HasChildren } from '@/utils/types';

import { SendFormAmountField } from './components/send-form-amount-field';
import { SendFormAsset } from './components/send-form-asset';
import { SendFormButton } from './components/send-form-button';
import { SendFormContainer } from './components/send-form-container';
import { SendFormMemo } from './components/send-form-memo';
import { SendFormNumpad } from './components/send-form-numpad';
import { SendFormRecipient } from './components/send-form-recipient';
import { SendFormContext, SendFormProvider } from './send-form-context';

type SendFormProps = SendFormContext;

function SendForm({
  protocol,
  symbol,
  availableBalance,
  fiatBalance,
  defaultValues,
  schema,
  ...props
}: SendFormProps & HasChildren) {
  return (
    <SendFormProvider
      value={{ protocol, symbol, availableBalance, fiatBalance, defaultValues, schema }}
    >
      <SendFormContainer {...props} />
    </SendFormProvider>
  );
}

SendForm.Asset = SendFormAsset;
SendForm.AmountField = SendFormAmountField;
SendForm.RecipientField = SendFormRecipient;
SendForm.Memo = SendFormMemo;
SendForm.Numpad = SendFormNumpad;
SendForm.Button = SendFormButton;

export { SendForm };
