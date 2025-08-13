import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { Account } from '@/store/accounts/accounts';

import { Money } from '@leather.io/models';
import { Box, Cell, HasChildren, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { AccountAvatar } from '../account/components/account-avatar';
import { TokenDetailsCard } from './components/token-details-card';

export function AddressList({ account, children }: HasChildren & { account: Account }) {
  return (
    <TokenDetailsCard
      title={
        <Box flexDirection="row" alignItems="center" gap="2">
          <AccountAvatar icon={account.icon} size={16} />
          <Text variant="label03">{account.name}</Text>
        </Box>
      }
    >
      {children}
    </TokenDetailsCard>
  );
}

interface AddressListItemProps {
  address: string;
  name: string;
  availableBalance?: Money;
  quoteBalance?: Money;
}

export function AddressListItem({
  address,
  name,
  availableBalance,
  quoteBalance,
}: AddressListItemProps) {
  const { receiveSheetRef } = useGlobalSheets();

  const onCopyAddress = useCopyAddress();

  return (
    <Cell.Root pressable={true} onPress={() => receiveSheetRef.current?.present()}>
      <Cell.Content>
        <Cell.Label variant="primary">
          <Text variant="label02">{name}</Text>
        </Cell.Label>
        <Cell.Label variant="secondary" onPress={() => void onCopyAddress(address)}>
          {truncateMiddle(address)}
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={availableBalance} variant="label02" />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance balance={quoteBalance} variant="caption01" color="ink.text-subdued" />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
