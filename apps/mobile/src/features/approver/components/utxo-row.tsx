import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { Avatar, Cell, LockIcon, UnlockIcon } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

interface UtxoRowProps {
  isLocked: boolean;
  address: string;
  btcAmount: Money;
  quoteAmount: Money;
  txid?: string;
}

export function UtxoRow({ isLocked, address, btcAmount, quoteAmount, txid }: UtxoRowProps) {
  const icon = isLocked ? <LockIcon /> : <UnlockIcon color="red.action-primary-default" />;

  return (
    <Cell.Root pressable={false}>
      <Cell.Icon>
        <Avatar icon={icon} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{truncateMiddle(address)}</Cell.Label>
        {txid && <Cell.Label variant="secondary">{truncateMiddle(txid)}</Cell.Label>}
      </Cell.Content>
      <Cell.Aside>
        <Balance balance={btcAmount} variant="label02" />
        <Balance balance={quoteAmount} variant="label02" color="ink.text-subdued" isQuoteCurrency />
      </Cell.Aside>
    </Cell.Root>
  );
}
