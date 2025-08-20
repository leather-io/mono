import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AssetType } from '@/features/receive/get-assets';
import { ReceiveType } from '@/features/receive/receive-flow-provider';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { Account } from '@/store/accounts/accounts';

import { Money } from '@leather.io/models';
import { Box, Cell, HasChildren, Text } from '@leather.io/ui/native';
import { match, truncateMiddle } from '@leather.io/utils';

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

const assetTypeMatch = match<AssetType>();
export function AddressListItem({
  address,
  name,
  assetType,
  availableBalance,
  quoteBalance,
}: AddressListItemProps) {
  const { receiveSheetRef } = useGlobalSheets();

  const onCopyAddress = useCopyAddress();

  function openReceiveSheet() {
    const receiveType = assetTypeMatch<ReceiveType>(assetType, {
      stacks: 'stacks',
      taproot: 'taproot',
      native_segwit: 'native-segwit',
    });

    receiveSheetRef.current?.present(receiveType);
  }
  return (
    <Cell.Root pressable={true} onPress={openReceiveSheet} mx="-5">
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
