import { HStack } from 'leather-styles/jsx';

import type { AccountId } from '@leather.io/models';
import { BulletSeparator, Caption } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { useBitcoinNativeSegwitAccountLoader } from '../loaders/bitcoin-account-loader';
import { useStacksAccountLoader } from '../loaders/stacks-account-loader';

interface AccountAddressesProps {
  accountId: AccountId;
}
export function AccountAddresses({ accountId }: AccountAddressesProps) {
  const account = useStacksAccountLoader({ accountId });
  const signer = useBitcoinNativeSegwitAccountLoader({ accountId });
  return (
    <HStack alignItems="center" gap="space.02" whiteSpace="nowrap">
      <BulletSeparator>
        {account ? <Caption>{truncateMiddle(account.address, 4)}</Caption> : null}
        {signer ? <Caption>{truncateMiddle(signer.address, 4)}</Caption> : null}
      </BulletSeparator>
    </HStack>
  );
}
