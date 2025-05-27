import { useCallback, useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { usePrevious } from '@/hooks/use-previous';
import BigNumber from 'bignumber.js';

export function useSendMax(maxSpend: BigNumber, form: any) {
  const isSendingMax = useWatch({ control: form.control, name: 'isSendingMax' });
  const recipient = useWatch({ control: form.control, name: 'recipient' });
  const previousRecipient = usePrevious(recipient);

  const setAmountToMax = useCallback(() => {
    form.setValue('amount', maxSpend.toString(), {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, maxSpend]);

  function setIsSendingMax() {
    form.setValue('isSendingMax', true, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleSetMax(isSendingMax: boolean) {
    if (isSendingMax) {
      setIsSendingMax();
      setAmountToMax();
    } else {
      form.setValue('isSendingMax', false);
    }
  }

  useEffect(() => {
    if (isSendingMax) {
      if (recipient !== previousRecipient) {
        setAmountToMax();
      }
    }
  }, [recipient, isSendingMax, previousRecipient, setAmountToMax]);

  return {
    onSetMax: handleSetMax,
  };
}
