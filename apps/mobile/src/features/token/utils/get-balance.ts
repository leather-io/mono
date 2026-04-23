import { FetchState } from '@/components/loading';

import {
  TokenBalance,
  isAccountQuotedBtcBalance,
  isAddressQuotedStxBalance,
  isSip10Balance,
} from '@leather.io/features';

export function getAvailableBalance(balance: FetchState<TokenBalance>) {
  if (balance.state === 'success') {
    if (isSip10Balance(balance.value)) {
      return balance.value.crypto.availableBalance;
    }
    if (isAccountQuotedBtcBalance(balance.value)) {
      return balance.value.btc.totalBalance;
    }
    if (isAddressQuotedStxBalance(balance.value)) {
      return balance.value.stx.availableUnlockedBalance;
    }
  }

  return undefined;
}

export function getQuoteBalance(balance: FetchState<TokenBalance>) {
  if (balance.state === 'success') {
    if (isSip10Balance(balance.value)) {
      return balance.value.quote.availableBalance;
    }
    if (isAccountQuotedBtcBalance(balance.value)) {
      return balance.value.quote.totalBalance;
    }
    if (isAddressQuotedStxBalance(balance.value)) {
      return balance.value.quote.availableUnlockedBalance;
    }
  }
  return undefined;
}
