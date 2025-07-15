import { useTotalBalance } from '@/queries/balance/total-balance.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';

type TokenBalance = {
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
};

export function useGetTokenBalance(tokenId: string): TokenBalance | undefined {
  const allBalances = useTotalBalance();

  if (tokenId === 'BTC') {
    if (allBalances.btc.state === 'success') {
      // return allBalances.btc.value?.quote.availableBalance;
      return {
        asset: btcAsset,
        availableBalance: allBalances.btc.value?.btc.availableBalance,
        quoteBalance: allBalances.btc.value?.quote.availableBalance,
      };
    }
  }
  if (tokenId === 'STX') {
    if (allBalances.stx.state === 'success') {
      return {
        asset: stxAsset,
        availableBalance: allBalances.stx.value?.stx.availableBalance,
        quoteBalance: allBalances.stx.value?.quote.availableBalance,
      };
    }
  }

  if (allBalances.sip10.state === 'success') {
    const sip10 = allBalances.sip10.value?.sip10s.find(
      (token: Sip10Balance) => token.asset.symbol === tokenId
    );
    if (sip10) {
      return {
        asset: sip10.asset,
        availableBalance: sip10.crypto.availableBalance,
        quoteBalance: sip10.quote.availableBalance,
      };
    }
  }

  return undefined;
}
