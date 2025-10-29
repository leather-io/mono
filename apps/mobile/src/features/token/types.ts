import { CryptoAssetProtocol } from '@leather.io/models';
import {
  AccountQuotedBtcBalance,
  AddressQuotedStxBalance,
  RuneBalance,
  Sip10Balance,
} from '@leather.io/services';
import { SerializedCryptoAssetId } from '@leather.io/utils';

export interface TokenDetailsProps {
  assetProtocol: CryptoAssetProtocol;
  assetId: string;
}
export interface CollectibleDetailsProps {
  assetProtocol: CryptoAssetProtocol;
  assetId: SerializedCryptoAssetId;
}

export interface OnPressTokenDetails {
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}

export type SupportedAssetProtocol =
  | 'nativeBtc'
  | 'nativeStx'
  | 'sip10'
  | 'rune'
  | 'sip9'
  | 'inscription'
  | 'stamp';

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
    // AccountQuotedBtcBalance has btc and quote with availableBalance
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
    // AddressQuotedStxBalance has stx and quote with availableUnlockedBalance
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
