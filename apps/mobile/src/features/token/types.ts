import { CryptoAssetProtocol } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetId: SerializedCryptoAssetId;
}

const supportedAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10', 'sip9'] as const;

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10'] as const;

const supportedNonFungibleAssetProtocols = ['sip9'] as const;

type SupportedAssetProtocol = (typeof supportedAssetProtocols)[number];
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

export function isSupportedAssetProtocol(
  value: CryptoAssetProtocol
): value is SupportedAssetProtocol {
  return (supportedAssetProtocols as readonly string[]).includes(value);
}
