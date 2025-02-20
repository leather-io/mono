import BigNumber from 'bignumber.js';

export function useSendMax(maxSpend: BigNumber, form: any) {
  function setIsSendingMax() {
    form.setValue('isSendingMax', true, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setAmountToMax() {
    form.setValue('amount', maxSpend.toString(), {
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

  return {
    onSetMax: handleSetMax,
  };
}
