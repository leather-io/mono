import { t } from '@lingui/macro';

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
      name: t({
        id: 'asset_name.bitcoin',
        message: 'Bitcoin',
      }),
      symbol: 'BTC',
      addressType: t({
        id: 'address_type.native_segwit',
        message: 'Native Segwit',
      }),
      description: t({
        id: 'asset_description.native_segwit',
        message: 'This is your Native Segwit address for receiving tokens  on the Bitcoin network.',
      }),
    },
    {
      type: AssetType.Taproot,
      address: taprootPayerAddress,
      name: t({
        id: 'asset_name.bitcoin',
        message: 'Bitcoin',
      }),
      symbol: 'BTC',
      addressType: t({
        id: 'address_type.taproot',
        message: 'Taproot',
      }),
      description: t({
        id: 'asset_description.taproot',
        message: 'This is your Taproot address for receiving tokens on the Bitcoin network.',
      }),
    },
    {
      type: AssetType.Stacks,
      address: stxAddress,
      name: t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      }),
      symbol: 'STX',
      description: t({
        id: 'asset_description.stacks',
        message: 'This is your address for receiving tokens on the Stacks network.',
      }),
    },
  ];
}
