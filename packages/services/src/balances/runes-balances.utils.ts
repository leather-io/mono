import { initBigNumber } from '@leather.io/utils';

import { BisRuneValidOutput } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';

export interface RunesOutputsBalances {
  [runeName: string]: string;
}

export function parseRunesOutputsBalances(outputs: BisRuneValidOutput[]) {
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
