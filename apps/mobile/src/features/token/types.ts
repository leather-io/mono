import { CryptoAssetProtocol } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetId: SerializedCryptoAssetId;
}

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10'] as const;

const supportedNonFungibleAssetProtocols = ['sip9'] as const;

type SupportedFungibleAssetProtocol = (typeof supportedFungibleAssetProtocols)[number];
type SupportedNonFungibleAssetProtocol = (typeof supportedNonFungibleAssetProtocols)[number];

export function isSupportedFungibleAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedFungibleAssetProtocol {
  return (supportedFungibleAssetProtocols as readonly string[]).includes(value);
}
export function isSupportedNonFungibleAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedNonFungibleAssetProtocol {
  return (supportedNonFungibleAssetProtocols as readonly string[]).includes(value);
}
