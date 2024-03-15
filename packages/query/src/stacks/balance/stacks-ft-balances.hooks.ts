import { createStacksCryptoCurrencyAssetTypeWrapper } from './stacks-ft-balances.utils';
import { parseBalanceResponse } from './stx-balance.hooks';
import { useStacksAccountBalanceQuery } from './stx-balance.query';

export function useStacksCryptoCurrencyAssetBalance(address: string) {
  return useStacksAccountBalanceQuery(address, {
    select: resp =>
      createStacksCryptoCurrencyAssetTypeWrapper(parseBalanceResponse(resp).stx.unlockedStx.amount),
  });
}
