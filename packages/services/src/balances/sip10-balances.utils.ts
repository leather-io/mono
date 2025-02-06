import { aggregateBaseCryptoAssetBalances } from '@leather.io/utils';

import { Sip10AddressBalance, Sip10AssetBalance } from './sip10-balances.service';

export function aggregateSip10AddressBalances(
  addressBalances: Sip10AddressBalance[]
): Sip10AssetBalance[] {
  return addressBalances
    .flatMap(entry => entry.sip10s)
    .reduce((acc, tokenBalance) => {
      const existingBalance = acc.find(b => b.asset.symbol === tokenBalance.asset.symbol);
      if (existingBalance) {
        existingBalance.crypto = aggregateBaseCryptoAssetBalances([
          existingBalance.crypto,
          tokenBalance.crypto,
        ]);
        existingBalance.usd = aggregateBaseCryptoAssetBalances([
          existingBalance.usd,
          tokenBalance.usd,
        ]);
      } else {
        acc.push({
          asset: tokenBalance.asset,
          crypto: tokenBalance.crypto,
          usd: tokenBalance.usd,
        });
      }
      return acc;
    }, [] as Sip10AssetBalance[]);
}
