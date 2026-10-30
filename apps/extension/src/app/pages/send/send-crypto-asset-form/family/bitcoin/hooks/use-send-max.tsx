import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import type { Money } from '@leather.io/models';

import type { BitcoinSendFormValues } from '@shared/models/form.model';
import { analytics } from '@shared/utils/analytics';

import { useToast } from '@app/features/toasts/use-toast';

interface UseSendMaxArgs {
  balance: Money;
  isSendingMax?: boolean;
  onSetIsSendingMax(value: boolean): void;
  sendMaxBalance: string;
  sendMaxFee: string;
}
export function useSendMax({
  balance,
  isSendingMax,
  onSetIsSendingMax,
  sendMaxBalance,
  sendMaxFee,
}: UseSendMaxArgs) {
  const { clearErrors, setValue } = useFormContext<BitcoinSendFormValues>();
  const toast = useToast();

  return useCallback(() => {
    analytics.track('select_maximum_amount_for_send');
    if (balance.amount.isLessThanOrEqualTo(0)) {
      toast.error('Zero balance');
      return;
    }
    onSetIsSendingMax(!isSendingMax);
    setValue('fee', sendMaxFee);
    setValue('amount', sendMaxBalance);
    clearErrors('amount');
  }, [
    balance.amount,
    clearErrors,
    isSendingMax,
    onSetIsSendingMax,
    sendMaxBalance,
    sendMaxFee,
    setValue,
    toast,
  ]);
}
