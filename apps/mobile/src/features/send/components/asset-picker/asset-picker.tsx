import { ReactNode, useMemo } from 'react';

import { renderAsset } from '@/features/balances/assets/render-assets';
import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { sortSip10Balances } from '@/features/balances/utils/sort-sip10-balances';
import { useSip10SendFlag } from '@/features/feature-flags';
import { AssetPickerItem } from '@/features/send/components/asset-picker/asset-picker-item';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { BottomSheetFlashList } from '@gorhom/bottom-sheet';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';

interface AssetListProps {
  account: Account | null;
  onSelectAsset(asset: FungibleCryptoAsset, assetElementOffsetTop: number | null): void;
}

interface AssetPickerFlashListProps {
  sip10Data: ReturnType<typeof useSip10TotalBalance>;
  header: ReactNode;
  handleSelectAsset(asset: FungibleCryptoAsset): (top: number | null) => void;
}

function AssetPickerFlashList({ sip10Data, header, handleSelectAsset }: AssetPickerFlashListProps) {
  const isSip10SendEnabled = useSip10SendFlag();
  const sip10Memo = useMemo(() => {
    if (sip10Data.state === 'success' && isSip10SendEnabled)
      return sip10Data.value.sip10s.sort(sortSip10Balances);
    return [];
  }, [sip10Data, isSip10SendEnabled]);

  return (
    <BottomSheetFlashList<Sip10Balance>
      data={sip10Memo}
      renderItem={({ item }) => (
        <AssetPickerItem onPress={handleSelectAsset(item.asset)}>
          {renderAsset({ item })}
        </AssetPickerItem>
      )}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<>{header}</>}
    />
  );
}

function GeneralAssetPicker({
  handleSelectAsset,
}: {
  handleSelectAsset(asset: FungibleCryptoAsset): (top: number | null) => void;
}) {
  const sip10Data = useSip10TotalBalance();

  return (
    <AssetPickerFlashList
      sip10Data={sip10Data}
      header={
        <>
          <AssetPickerItem onPress={handleSelectAsset(btcAsset)}>
            <BitcoinBalance />
          </AssetPickerItem>
          <AssetPickerItem onPress={handleSelectAsset(stxAsset)}>
            <StacksBalance />
          </AssetPickerItem>
        </>
      }
      handleSelectAsset={handleSelectAsset}
    />
  );
}
function AccountAssetPicker({
  handleSelectAsset,
  account,
}: {
  handleSelectAsset(asset: FungibleCryptoAsset): (top: number | null) => void;
  account: Account;
}) {
  const sip10Data = useSip10AccountBalance(account.fingerprint, account.accountIndex);

  return (
    <AssetPickerFlashList
      sip10Data={sip10Data}
      header={
        <>
          <AssetPickerItem onPress={handleSelectAsset(btcAsset)}>
            <BitcoinBalanceByAccount
              fingerprint={account.fingerprint}
              accountIndex={account.accountIndex}
            />
          </AssetPickerItem>
          <AssetPickerItem onPress={handleSelectAsset(stxAsset)}>
            <StacksBalanceByAccount
              fingerprint={account.fingerprint}
              accountIndex={account.accountIndex}
            />
          </AssetPickerItem>
        </>
      }
      handleSelectAsset={handleSelectAsset}
    />
  );
}

export function AssetPicker({ account, onSelectAsset }: AssetListProps) {
  function handleSelectAsset(asset: FungibleCryptoAsset) {
    return (top: number | null) => onSelectAsset(asset, top);
  }

  return account ? (
    <AccountAssetPicker account={account} handleSelectAsset={handleSelectAsset} />
  ) : (
    <GeneralAssetPicker handleSelectAsset={handleSelectAsset} />
  );
}
