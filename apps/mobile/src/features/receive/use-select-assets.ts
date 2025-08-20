import { AssetType, getAssets } from '@/features/receive/get-assets';
import { Account } from '@/store/accounts/accounts';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

import { ReceiveType } from './receive-flow-provider';

interface UseSelectAssetProps {
  currentAccount: Account;
  receiveType: ReceiveType;
}
export function useSelectAssets({ currentAccount, receiveType }: UseSelectAssetProps) {
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );

  const assets = getAssets({
    nativeSegwitPayerAddress: nativeSegwitPayerAddress,
    taprootPayerAddress: taprootPayerAddress,
    stxAddress: stxAddress ?? '',
  });

  switch (receiveType) {
    case 'stacks':
      return assets.filter(asset => asset.type === AssetType.Stacks);
    case 'bitcoin':
      return assets.filter(
        asset => asset.type === AssetType.Taproot || asset.type === AssetType.NativeSegwit
      );
    case 'taproot':
      return assets.filter(asset => asset.type === AssetType.Taproot);
    case 'native-segwit':
      return assets.filter(asset => asset.type === AssetType.NativeSegwit);
    case 'all':
    default:
      return assets;
  }
}
