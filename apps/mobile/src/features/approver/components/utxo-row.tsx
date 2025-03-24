import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { Avatar, Cell, LockIcon, UnlockIcon } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

interface UtxoRowProps {
  isLocked: boolean;
  address: string;
  btcAmount: Money;
  fiatAmount: Money;
  txid?: string;
}

export function UtxoRow({ isLocked, address, btcAmount, fiatAmount, txid }: UtxoRowProps) {
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
        <Balance balance={fiatAmount} variant="label02" color="ink.text-subdued" />
      </Cell.Aside>
    </Cell.Root>
  );
}
