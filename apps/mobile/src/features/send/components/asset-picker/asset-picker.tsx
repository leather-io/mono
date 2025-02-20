import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { AssetPickerItem } from '@/features/send/components/asset-picker/asset-picker-item';
import { SendableAsset } from '@/features/send/types';
import { Account } from '@/store/accounts/accounts';

interface AssetListProps {
  account: Account | null;
  onSelectAsset(asset: SendableAsset, assetElementOffsetTop: number | null): void;
}

export function AssetPicker({ account, onSelectAsset }: AssetListProps) {
  function handleSelectAsset(asset: SendableAsset) {
    return (top: number | null) => onSelectAsset(asset, top);
  }

  return account ? (
    <>
      <AssetPickerItem onPress={handleSelectAsset('btc')}>
        <BitcoinBalanceByAccount
          fingerprint={account.fingerprint}
          accountIndex={account.accountIndex}
        />
      </AssetPickerItem>
      <AssetPickerItem onPress={handleSelectAsset('stx')}>
        <StacksBalanceByAccount
          fingerprint={account.fingerprint}
          accountIndex={account.accountIndex}
        />
      </AssetPickerItem>
    </>
  ) : (
    <>
      <AssetPickerItem onPress={handleSelectAsset('btc')}>
        <BitcoinBalance />
      </AssetPickerItem>
      <AssetPickerItem onPress={handleSelectAsset('stx')}>
        <StacksBalance />
      </AssetPickerItem>
    </>
  );
}
