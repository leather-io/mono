import { CryptoAssetBalance } from '@leather.io/models';
import { aggregateBaseCryptoAssetBalances } from '@leather.io/utils';

import { Sip10AddressBalance, Sip10Balance } from './sip10-balances.service';

export function combineSip10Balances(addressBalances: Sip10AddressBalance[]): Sip10Balance[] {
  return addressBalances
    .flatMap(entry => entry.sip10s)
    .reduce((acc, tokenBalance) => {
      const existingBalance = acc.find(b => b.asset.symbol === tokenBalance.asset.symbol);
      if (existingBalance) {
        existingBalance.crypto = aggregateBaseCryptoAssetBalances([
          existingBalance.crypto,
          tokenBalance.crypto,
        ]);
        existingBalance.quote = aggregateBaseCryptoAssetBalances([
          existingBalance.quote,
          tokenBalance.quote,
        ]);
      } else {
        acc.push({
          asset: tokenBalance.asset,
          crypto: tokenBalance.crypto,
          quote: tokenBalance.quote,
        });
      }
      return acc;
    }, [] as Sip10Balance[]);
}

export function sortByAvailableQuoteBalance(
  a: { quote: CryptoAssetBalance },
  b: { quote: CryptoAssetBalance }
) {
  return b.quote.availableBalance.amount.minus(a.quote.availableBalance.amount).toNumber();
}
