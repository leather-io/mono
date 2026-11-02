import { useCallback, useEffect } from 'react';
import { type SetValueConfig } from 'react-hook-form';

import { usePrevious } from '@/hooks/use-previous';
import type BigNumber from 'bignumber.js';

interface SendMaxSetValue {
  (name: 'amount', value: string, options?: SetValueConfig): void;
  (name: 'isSendingMax', value: boolean, options?: SetValueConfig): void;
}

interface SendMaxForm {
  isSendingMax: boolean;
  recipient: string;
  setValue: SendMaxSetValue;
}

export function useSendMax(
  maxSpend: BigNumber,
  { isSendingMax, recipient, setValue }: SendMaxForm
) {
  const previousRecipient = usePrevious(recipient);

  const setAmountToMax = useCallback(() => {
    setValue('amount', maxSpend.toString(), {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, maxSpend]);

  function setIsSendingMax() {
    setValue('isSendingMax', true, {
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
      setValue('isSendingMax', false);
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
