import { useEffect, useMemo, useState } from 'react';

import BtcAvatarIconSrc from '@assets/avatars/btc-avatar-icon.png';
import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { useCalculateMaxBitcoinSpend } from '@app/common/hooks/balance/use-calculate-max-spend';
import { useCurrentNativeSegwitBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import type { SwapAsset } from '@app/query/common/alex-sdk/alex-sdk.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

function fallbackHardcodedBalanceMinusFee(balance: Money) {
  return createMoney(BigNumber.max(0, balance.amount.minus(1000)), balance.symbol);
}

export function useBtcSwapAsset() {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const currentBitcoinAddress = nativeSegwitSigner?.address ?? '';
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const { btc: balance } = useCurrentNativeSegwitBtcBalanceWithFallback();
  const bitcoinMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  const [maxSpendableBalance, setMaxSpendableBalance] = useState<Money>(() =>
    fallbackHardcodedBalanceMinusFee(balance.availableBalance)
  );

  useEffect(() => {
    let canceled = false;
    if (!currentBitcoinAddress) {
      setMaxSpendableBalance(fallbackHardcodedBalanceMinusFee(balance.availableBalance));
      return () => {
        canceled = true;
      };
    }
    void calcMaxSpend(currentBitcoinAddress)
      .then(result => {
        if (!canceled && result) setMaxSpendableBalance(result.amount);
      })
      .catch(() => {
        if (!canceled) setMaxSpendableBalance(fallbackHardcodedBalanceMinusFee(balance.availableBalance));
      });
    return () => {
      canceled = true;
    };
  }, [balance.availableBalance, calcMaxSpend, currentBitcoinAddress]);

  return useMemo((): SwapAsset => {
    return {
      balance: maxSpendableBalance,
      tokenId: 'token-btc',
      displayName: 'Bitcoin',
      fallback: 'BT',
      icon: BtcAvatarIconSrc,
      name: 'BTC',
      marketData: bitcoinMarketData,
      principal: '',
    };
  }, [maxSpendableBalance, bitcoinMarketData]);
}
