import { useController, useFormContext } from 'react-hook-form';

import { AmountField } from '@/components/amount-field/amount-field';
import { z } from 'zod';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

type CurrencyMode = 'crypto' | 'fiat';

export function SendFormAmountField<T extends SendFormBaseContext<T>>() {
  // FIXME: this is annoying as it keeps throwing a lint error
  //  error  'schema' is assigned a value but only used as a type  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formData } = useSendFormContext<T>();

  const { watch, control } = useFormContext<z.infer<typeof formData.schema>>();

  const {
    field: { onChange: onChangeAmount, value },
    fieldState: { isTouched: isTouchedAmount, invalid: isInvalidAmount },
  } = useController({ name: 'amount', control });

  const {
    field: { onChange: onChangeCurrencyMode },
    fieldState: { isTouched: isTouchedCurrency, invalid: isInvalidCurrency },
  } = useController({ name: 'currencyMode', control });

  const currencyMode = watch('currencyMode');

  function handleCurrencyModeChange(currencyMode: CurrencyMode, newInputValue: string) {
    onChangeCurrencyMode(currencyMode);
    onChangeAmount(newInputValue);
  }

  const isTouched = isTouchedAmount || isTouchedCurrency;
  const isInvalid = isInvalidAmount || isInvalidCurrency;

  return (
    <AmountField
      inputValue={value}
      invalid={isTouched && isInvalid}
      currencyMode={currencyMode}
      onCurrencyModeChange={handleCurrencyModeChange}
      onSetIsSendingMax={() => {
        // set input value to available balance in `currencyMode`
      }}
      formatValue={(value, currencyMode) =>
        // format value based on currencyMode, i.e. prepend $ for fiat, append BTC to crypto
        // console.log(value, currencyMode);
        currencyMode ? value : value
      }
      calculateSecondaryValue={(value, currencyMode) =>
        // convert primary value from fiat to crypto or vice versa depending on current mode
        // console.log(value, currencyMode);
        currencyMode ? value : value
      }
    />
  );
}
