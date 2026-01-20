import { CryptoAssetProtocol } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetId: SerializedCryptoAssetId;
}

const supportedAssetProtocols = [
  'nativeBtc',
  'nativeStx',
  'sip10',
  'rune',
  'sip9',
  'inscription',
  'stamp',
] as const;

const supportedFungibleAssetProtocols = ['nativeBtc', 'nativeStx', 'sip10', 'rune'] as const;

const supportedNonFungibleAssetProtocols = ['inscription', 'sip9', 'stamp'] as const;

export type SupportedAssetProtocol = (typeof supportedAssetProtocols)[number];
export type SupportedFungibleAssetProtocol = (typeof supportedFungibleAssetProtocols)[number];
export type SupportedNonFungibleAssetProtocol = (typeof supportedNonFungibleAssetProtocols)[number];

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
