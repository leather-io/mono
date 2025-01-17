import { BaseCryptoAssetBalance } from '@leather.io/models';
import { sumMoney } from '@leather.io/utils';

import { Sip10AssetBalance } from './sip10-balances.service';

interface SumBaseCryptoAssetBalance {
  initialBalance: BaseCryptoAssetBalance;
  accumulatedBalance: BaseCryptoAssetBalance;
}

export function sumBalances({
  initialBalance,
  accumulatedBalance,
}: SumBaseCryptoAssetBalance): BaseCryptoAssetBalance {
  return {
    ...initialBalance,
    totalBalance: sumMoney([initialBalance.totalBalance, accumulatedBalance.totalBalance]),
    inboundBalance: sumMoney([initialBalance.inboundBalance, accumulatedBalance.inboundBalance]),
    outboundBalance: sumMoney([initialBalance.outboundBalance, accumulatedBalance.outboundBalance]),
    pendingBalance: sumMoney([initialBalance.pendingBalance, accumulatedBalance.pendingBalance]),
    availableBalance: sumMoney([
      initialBalance.availableBalance,
      accumulatedBalance.availableBalance,
    ]),
  };
}

export function getAggregateSip10Balances(
  addressBalances: { sip10s: Sip10AssetBalance[] }[]
): Sip10AssetBalance[] {
  return addressBalances
    .flatMap(entry => entry.sip10s)
    .reduce((acc, balance) => {
      const existingBalance = acc.find(b => b.asset.symbol === balance.asset.symbol);
      if (existingBalance) {
        existingBalance.sip10 = sumBalances({
          initialBalance: existingBalance.sip10,
          accumulatedBalance: balance.sip10,
        });
        existingBalance.usd = sumBalances({
          initialBalance: existingBalance.usd,
          accumulatedBalance: balance.usd,
        });
      } else {
        acc.push({
          asset: balance.asset,
          sip10: balance.sip10,
          usd: balance.usd,
        });
      }
      return acc;
    }, [] as Sip10AssetBalance[]);
}
