import type { AccountId } from '@leather.io/models';
import { Caption } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { BitcoinNativeSegwitAccountLoader } from '../loaders/bitcoin-account-loader';

interface AccountBitcoinAddressProps {
  accountId: AccountId;
}
export function AccountBitcoinAddress({ accountId }: AccountBitcoinAddressProps) {
  return (
    <BitcoinNativeSegwitAccountLoader accountId={accountId}>
      {signer => <Caption>{truncateMiddle(signer.address, 4)}</Caption>}
    </BitcoinNativeSegwitAccountLoader>
  );
}
