import { CryptoAssetProtocol } from '@leather.io/models';
import {
  AccountQuotedBtcBalance,
  AddressQuotedStxBalance,
  RuneBalance,
  Sip10Balance,
} from '@leather.io/services';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetId: SerializedCryptoAssetId;
}

export interface OnPressTokenDetails {
  onPress?: (tokenDetails: TokenDetailsProps) => void;
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

export type TokenBalance =
  | AccountQuotedBtcBalance
  | AddressQuotedStxBalance
  | Sip10Balance
  | RuneBalance;

export function isAccountQuotedBtcBalance(
  value: AccountQuotedBtcBalance | AddressQuotedStxBalance
): value is AccountQuotedBtcBalance {
  return (
    value &&
    typeof value === 'object' &&
    'btc' in value &&
    'quote' in value &&
    value.btc !== undefined &&
    value.quote !== undefined &&
    'availableBalance' in value.btc
  );
}

export function isAddressQuotedStxBalance(
  value: AccountQuotedBtcBalance | AddressQuotedStxBalance
): value is AddressQuotedStxBalance {
  return (
    value &&
    typeof value === 'object' &&
    'stx' in value &&
    'quote' in value &&
    value.stx !== undefined &&
    value.quote !== undefined &&
    'availableUnlockedBalance' in value.stx
  );
}

export function isSip10Balance(value: TokenBalance): value is Sip10Balance {
  return (
    value &&
    typeof value === 'object' &&
    'asset' in value &&
    'quote' in value &&
    'crypto' in value &&
    'availableBalance' in value.crypto
  );
}

export function isRuneBalance(value: TokenBalance): value is RuneBalance {
  return (
    value &&
    typeof value === 'object' &&
    'asset' in value &&
    'quote' in value &&
    'crypto' in value &&
    'availableBalance' in value.crypto
  );
}
