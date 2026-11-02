import { type CryptoAssetProtocol } from '@leather.io/models';
import { type SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetId: SerializedCryptoAssetId;
}

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10'] as const;

const supportedNonFungibleAssetProtocols = ['sip9'] as const;

export function isSupportedFungibleAssetProtocol(value: CryptoAssetProtocol) {
  return supportedFungibleAssetProtocols.some(protocol => protocol === value);
}
export function isSupportedNonFungibleAssetProtocol(value: CryptoAssetProtocol) {
  return supportedNonFungibleAssetProtocols.some(protocol => protocol === value);
}
