import { t } from '@lingui/core/macro';

enum AssetType {
  NativeSegwit = 'native_segwit',
  Taproot = 'taproot',
  Stacks = 'stacks',
}

export function getAssets({
  nativeSegwitPayerAddress,
  taprootPayerAddress,
  stxAddress,
}: {
  nativeSegwitPayerAddress: string;
  taprootPayerAddress: string;
  stxAddress: string;
}) {
  return [
    {
      type: AssetType.NativeSegwit,
      address: nativeSegwitPayerAddress,
      name: t`Bitcoin`,
      symbol: 'BTC',
      addressType: t`Native Segwit`,
      description: t`This is your Native Segwit address for receiving tokens on the Bitcoin network.`,
    },
    {
      type: AssetType.Taproot,
      address: taprootPayerAddress,
      name: t`Bitcoin`,
      symbol: 'BTC',
      addressType: t`Taproot`,
      description: t`This is your Taproot address for receiving tokens on the Bitcoin network.`,
    },
    {
      type: AssetType.Stacks,
      address: stxAddress,
      name: t`Stacks`,
      symbol: 'STX',
      description: t`This is your address for receiving tokens on the Stacks network.`,
    },
  ];
}
