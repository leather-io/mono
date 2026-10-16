import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Link } from '@leather.io/ui';

import type { BitcoinSendFormValues } from '@shared/models/form.model';

import { useCalculateMaxBitcoinSpend } from '@app/common/hooks/balance/use-calculate-max-spend';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { useSendMax } from '../hooks/use-send-max';

const sendMaxTooltipLabel = 'This amount is affected by the fee you choose';

interface BitcoinSendMaxButtonProps {
  balance: Money;
  isSendingMax?: boolean;
  onSetIsSendingMax(value: boolean): void;
}
export function BitcoinSendMaxButton({
  balance,
  isSendingMax,
  onSetIsSendingMax,
  ...props
}: BitcoinSendMaxButtonProps) {
  const { setValue, watch } = useFormContext<BitcoinSendFormValues>();
  const recipient = watch('recipient');
  const amount = watch('amount');
  const fee = watch('fee');
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const { utxos } = useCurrentUtxos();
  const sendMaxCalculation = calcMaxSpend(recipient, utxos.available);
  const sendMaxBalance = sendMaxCalculation.spendableBitcoin.toString();
  const sendMaxFee = sendMaxCalculation.spendAllFee.toString();

  const onSendMax = useSendMax({
    balance,
    isSendingMax,
    onSetIsSendingMax,
    sendMaxBalance,
    sendMaxFee,
  });

  // whenever recipient changes, update the fees
  useEffect(() => {
    if (isSendingMax) {
      if (amount !== sendMaxBalance) setValue('amount', sendMaxBalance);
      if (fee !== sendMaxFee) setValue('fee', sendMaxFee);
    }
  }, [isSendingMax, setValue, sendMaxBalance, sendMaxFee, fee, amount]);

  // Hide send max button if lowest fee calc is greater
  // than available balance which will default to zero
  if (sendMaxBalance === '0') return <Box height="32px" />;

  return (
    <BasicTooltip label={sendMaxTooltipLabel} side="bottom" asChild>
      <Link
        data-testid={SendCryptoAssetSelectors.SendMaxBtn}
        onClick={() => onSendMax()}
        {...props}
      >
        {isSendingMax ? 'Sending max' : 'Send max'}
      </Link>
    </BasicTooltip>
  );
}
