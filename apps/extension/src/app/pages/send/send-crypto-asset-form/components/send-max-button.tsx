import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Link } from '@leather.io/ui';

import type { StacksSendFormValues } from '@shared/models/form.model';
import { analytics } from '@shared/utils/analytics';

import { useToast } from '@app/features/toasts/use-toast';

interface SendMaxButtonProps {
  balance: Money;
  sendMaxBalance: string;
}
export function SendMaxButton({ balance, sendMaxBalance, ...props }: SendMaxButtonProps) {
  const { setValue } = useFormContext<StacksSendFormValues>();
  const toast = useToast();

  const onSendMax = useCallback(() => {
    analytics.track('select_maximum_amount_for_send');
    if (balance.amount.isLessThanOrEqualTo(0)) {
      toast.error('Zero balance');
      return;
    }
    setValue('amount', sendMaxBalance);
  }, [balance.amount, sendMaxBalance, setValue, toast]);

  // Hide send max button if lowest fee calc is greater
  // than available balance which will default to zero
  if (sendMaxBalance === '0') return <Box height="32px" />;

  return (
    <Link data-testid={SendCryptoAssetSelectors.SendMaxBtn} onClick={onSendMax} {...props}>
      Send max
    </Link>
  );
}
