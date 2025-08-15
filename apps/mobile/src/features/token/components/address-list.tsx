import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AssetType } from '@/features/receive/get-assets';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { Account } from '@/store/accounts/accounts';
import { router } from 'expo-router';

import { Money } from '@leather.io/models';
import { Box, Cell, HasChildren, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { accountIconMap } from '../../account/components/account-avatar';
import { TokenDetailsCard } from './token-details-card';

export function AddressList({ account, children }: HasChildren & { account: Account }) {
  const AccountIcon = accountIconMap[account.icon];

  return (
    <TokenDetailsCard
      title={
        <Box flexDirection="row" alignItems="center" gap="2" mb="2">
          <AccountIcon variant="small" />
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
  assetType: AssetType;
  name: string;
  availableBalance?: Money;
  quoteBalance?: Money;
}

export function AddressListItem({
  address,
  assetType,
  name,
  availableBalance,
  quoteBalance,
}: AddressListItemProps) {
  const { receiveSheetRef } = useGlobalSheets();

  const onCopyAddress = useCopyAddress();

  function openReceiveSheet() {
    router.setParams({
      assetType,
    });
    receiveSheetRef.current?.present();
  }
  return (
    <Cell.Root pressable={true} onPress={openReceiveSheet}>
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
