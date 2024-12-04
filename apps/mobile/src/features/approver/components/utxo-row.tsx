import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { Avatar, Flag, ItemLayout, LockIcon, UnlockIcon } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

interface UtxoRowProps {
  isLocked: boolean;
  address: string;
  btcBalance: Money;
  usdBalance: Money;
  txid?: string;
}

export function UtxoRow({ isLocked, address, btcBalance, usdBalance, txid }: UtxoRowProps) {
  const icon = isLocked ? <LockIcon /> : <UnlockIcon color="red" />;

  return (
    <Flag img={<Avatar bg="ink.background-secondary">{icon}</Avatar>}>
      <ItemLayout
        titleLeft={truncateMiddle(address)}
        captionLeft={txid ? truncateMiddle(txid) : undefined}
        titleRight={<Balance balance={btcBalance} variant="label02" />}
        captionRight={<Balance balance={usdBalance} variant="label02" color="ink.text-subdued" />}
      />
    </Flag>
  );
}
