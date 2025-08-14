import { AssetType, getAssets } from '@/features/receive/get-assets';
import { Account } from '@/store/accounts/accounts';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

interface UseSelectAssetProps {
  selectedAccount?: Account;
  tokenId?: string;
  assetType?: AssetType;
}
export function useSelectAssets({ selectedAccount, tokenId, assetType }: UseSelectAssetProps) {
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    selectedAccount?.fingerprint ?? '',
    selectedAccount?.accountIndex ?? 0
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    selectedAccount?.fingerprint ?? '',
    selectedAccount?.accountIndex ?? 0
  );

  const assets = getAssets({
    nativeSegwitPayerAddress: nativeSegwitPayerAddress ?? '',
    taprootPayerAddress: taprootPayerAddress ?? '',
    stxAddress: stxAddress ?? '',
  });

  if (selectedAccount && tokenId) {
    const tokenAssetSymbol = tokenId !== 'BTC' && tokenId !== 'STX' ? 'STX' : tokenId;

    // assetType is passed to receive sheet in specific cases e.g. taproot or native segwit
    if (assetType) {
      return assets.filter(asset => asset.type === assetType);
    }

    return assets.filter(asset => asset.symbol === tokenAssetSymbol);
  }

  return undefined;
}
