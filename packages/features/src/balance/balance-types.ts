import { CryptoAssetProtocols } from '@leather.io/models';
import {
  AccountQuotedBtcBalance,
  AddressQuotedStxBalance,
  Sip10Balance,
} from '@leather.io/services';

export type TokenBalance = AccountQuotedBtcBalance | AddressQuotedStxBalance | Sip10Balance;

export function isAccountQuotedBtcBalance(value: TokenBalance): value is AccountQuotedBtcBalance {
  return 'btc' in value;
}

export function isAddressQuotedStxBalance(value: TokenBalance): value is AddressQuotedStxBalance {
  return 'stx' in value;
}

export function isSip10Balance(value: TokenBalance): value is Sip10Balance {
  return 'asset' in value && value.asset.protocol === CryptoAssetProtocols.sip10;
}
