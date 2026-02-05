import { useMemo } from 'react';

import BtcAvatarIconSrc from '@assets/avatars/btc-avatar-icon.png';
import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { useCalculateMaxBitcoinSpend } from '@app/common/hooks/balance/use-calculate-max-spend';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import type { SwapAsset } from '@app/query/common/alex-sdk/alex-sdk.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

function fallbackHardcodedBalanceMinusFee(balance: Money) {
  return createMoney(BigNumber.max(0, balance.amount.minus(1000)), balance.symbol);
}

export function useBtcSwapAsset() {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroPayerNullable();
  const currentBitcoinAddress = nativeSegwitSigner?.address ?? '';
  const { utxos } = useCurrentUtxos();
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const bitcoinMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');

  const maxSpendableBalance = useMemo(() => {
    if (!currentBitcoinAddress || utxos.available.length === 0)
      return fallbackHardcodedBalanceMinusFee(balance.availableBalance);

    return calcMaxSpend(currentBitcoinAddress, utxos.available).amount;
  }, [currentBitcoinAddress, utxos, calcMaxSpend, balance.availableBalance]);

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
