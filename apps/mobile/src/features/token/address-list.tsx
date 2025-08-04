import { useRef, useState } from 'react';

import { Balance } from '@/components/balance/balance';
import { useCopyAddress } from '@/hooks/use-copy-address';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/core/macro';

import { Money } from '@leather.io/models';
import { Box, Cell, SheetRef, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

import { AccountAvatar } from '../account/components/account-avatar';
import { getAssets } from '../receive/get-assets';
import { SelectedAsset } from '../receive/screens/select-asset';
import { TokenDetailsCard } from './components/token-details-card';
import { useGetAccountTokenBalance } from './hooks/use-get-token-balance';
import { ReceiveSheet, ReceiveSheetData } from './token-receive-sheet';

export function AccountAddressList({
  tokenId,
  accountIndex,
  fingerprint,
}: {
  tokenId: string;
  accountIndex: number;
  fingerprint: string;
}) {
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account) {
    return null;
  }

  return (
    <TokenDetailsCard
      title={
        <Box flexDirection="row" alignItems="center" gap="2">
          {/* FIXME - this icon needs to be 16x16 but require refactors to make it work */}
          <AccountAvatar icon={account.icon} />
          <Text variant="label03">{account.name}</Text>
        </Box>
      }
    >
      <AddressList account={account} tokenId={tokenId} />
    </TokenDetailsCard>
  );
}

function AddressList({ account, tokenId }: { account: Account; tokenId: string }) {
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );

  const assets = getAssets({
    nativeSegwitPayerAddress,
    taprootPayerAddress,
    stxAddress: stxAddress ?? '',
  });

  const tokenBalance = useGetAccountTokenBalance({ tokenId, account });
  const availableBalance = tokenBalance?.availableBalance;
  const quoteBalance = tokenBalance?.quoteBalance;

  if (tokenId === 'BTC') {
    return (
      <Box>
        <AddressListItem
          accountName={account.name}
          address={nativeSegwitPayerAddress}
          name={t`Native Segwit`}
          tokenId={tokenId}
          availableBalance={availableBalance}
          quoteBalance={quoteBalance}
          asset={assets[0]}
        />
        <AddressListItem
          accountName={account.name}
          address={taprootPayerAddress}
          name={t`Taproot`}
          tokenId={tokenId}
          availableBalance={availableBalance}
          quoteBalance={quoteBalance}
          asset={assets[1]}
        />
      </Box>
    );
  }
  return (
    <Box>
      <AddressListItem
        accountName={account.name}
        address={stxAddress ?? ''}
        name={t`STX`}
        tokenId={tokenId}
        availableBalance={availableBalance}
        quoteBalance={quoteBalance}
        asset={assets[2]}
      />
    </Box>
  );
}

interface AddressListItemProps {
  asset?: SelectedAsset;
  accountName: string;
  address: string;
  name: string;
  availableBalance?: Money;
  quoteBalance?: Money;
  tokenId: string;
}

function AddressListItem({
  asset,
  accountName,
  address,
  name,
  availableBalance,
  quoteBalance,
}: AddressListItemProps) {
  const [sheetData, setSheetData] = useState<ReceiveSheetData | null>(null);
  const receiveSheetRef = useRef<SheetRef>(null);

  const onCopyAddress = useCopyAddress();
  function handleCopyAddress(address: string) {
    // analytics.track('receive_address_copied', { asset: account.name, location: 'list_item' });
    void onCopyAddress(address);
  }

  if (!asset) {
    return null;
  }

  return (
    <>
      <Cell.Root
        pressable={true}
        onPress={() => {
          setSheetData({
            asset: asset,
            accountName: accountName,
          });
          receiveSheetRef.current?.present();
        }}
      >
        <Cell.Content>
          <Cell.Label variant="primary">
            <Text variant="label02">{name}</Text>
          </Cell.Label>
          <Cell.Label variant="secondary" onPress={() => handleCopyAddress(address)}>
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
      {sheetData && <ReceiveSheet data={sheetData} sheetRef={receiveSheetRef} />}
    </>
  );
}
