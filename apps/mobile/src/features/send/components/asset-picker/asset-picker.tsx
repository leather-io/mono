import { ReactNode, useMemo } from 'react';

import { renderAsset } from '@/features/balances/assets/render-assets';
import { sortSip10Balances } from '@/features/balances/assets/utils/sort-sip10-balances';
import { BitcoinBalanceByAccount } from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useSip10SendFlag } from '@/features/feature-flags';
import { AssetPickerItem } from '@/features/send/components/asset-picker/asset-picker-item';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { ListRenderItemInfo } from '@shopify/flash-list';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';
import { Sheet } from '@leather.io/ui/native';

interface AssetListProps {
  onSelectAsset(asset: FungibleCryptoAsset, assetElementOffsetTop: number | null): void;
  fingerprint: string;
  accountIndex: number;
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
    <Sheet.FlashList
      data={sip10Memo}
      renderItem={({ item }: ListRenderItemInfo<Sip10Balance>) => (
        <AssetPickerItem onPress={handleSelectAsset(item.asset)}>
          {renderAsset({ item })}
        </AssetPickerItem>
      )}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<>{header}</>}
    />
  );
}

function AccountAssetPicker({
  handleSelectAsset,
  fingerprint,
  accountIndex,
}: {
  handleSelectAsset(asset: FungibleCryptoAsset): (top: number | null) => void;
  fingerprint: string;
  accountIndex: number;
}) {
  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);

  return (
    <AssetPickerFlashList
      header={
        <>
          <AssetPickerItem onPress={handleSelectAsset(btcAsset)} canAnimate>
            <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
          </AssetPickerItem>
          <AssetPickerItem onPress={handleSelectAsset(stxAsset)} canAnimate>
            <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
          </AssetPickerItem>
        </>
      }
      sip10Data={sip10Data}
      handleSelectAsset={handleSelectAsset}
    />
  );
}

export function AssetPicker({ onSelectAsset, fingerprint, accountIndex }: AssetListProps) {
  function handleSelectAsset(asset: FungibleCryptoAsset) {
    return (top: number | null) => onSelectAsset(asset, top);
  }

  return (
    <AccountAssetPicker
      fingerprint={fingerprint}
      accountIndex={accountIndex}
      handleSelectAsset={handleSelectAsset}
    />
  );
}
