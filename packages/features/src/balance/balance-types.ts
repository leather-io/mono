import { CryptoAssetProtocols } from '@leather.io/models';
import {
  type AccountQuotedBtcBalance,
  type AddressQuotedStxBalance,
  type Sip10Balance,
} from '@leather.io/services';

export type TokenBalance = AccountQuotedBtcBalance | AddressQuotedStxBalance | Sip10Balance;

export function isAccountQuotedBtcBalance(value: TokenBalance) {
  return 'btc' in value;
}

export function isAddressQuotedStxBalance(value: TokenBalance) {
  return 'stx' in value;
}

export function isSip10Balance(value: TokenBalance): value is Sip10Balance {
  return 'asset' in value && value.asset.protocol === CryptoAssetProtocols.sip10;
}
