import { aggregateBaseCryptoAssetBalances, initBigNumber } from '@leather.io/utils';

import { BisRuneValidOutput } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { RuneAssetBalance, RunesAccountBalance } from './runes-balances.service';

export interface RunesOutputsBalances {
  [runeName: string]: string;
}

export function readRunesOutputsBalances(outputs: BisRuneValidOutput[]) {
  const runesBalances: RunesOutputsBalances = {};
  for (const output of outputs) {
    for (let i = 0; i < output.rune_names.length; i++) {
      const runeName = output.rune_names[i];
      const balance = output.balances.length > i ? output.balances[i] : '0';
      if (!runesBalances[runeName]) {
        runesBalances[runeName] = balance;
      } else {
        runesBalances[runeName] = initBigNumber(runesBalances[runeName]).plus(balance).toString();
      }
    }
  }
  return runesBalances;
}

export function aggregateRunesAccountBalances(
  accountBalances: RunesAccountBalance[]
): RuneAssetBalance[] {
  return accountBalances
    .flatMap(entry => entry.runes)
    .reduce((acc, runeBalance) => {
      const existingBalance = acc.find(b => b.asset.runeName === runeBalance.asset.runeName);
      if (existingBalance) {
        existingBalance.crypto = aggregateBaseCryptoAssetBalances([
          existingBalance.crypto,
          runeBalance.crypto,
        ]);
        existingBalance.usd = aggregateBaseCryptoAssetBalances([
          existingBalance.usd,
          runeBalance.usd,
        ]);
      } else {
        acc.push({
          asset: runeBalance.asset,
          crypto: runeBalance.crypto,
          usd: runeBalance.usd,
        });
      }
      return acc;
    }, [] as RuneAssetBalance[]);
}
