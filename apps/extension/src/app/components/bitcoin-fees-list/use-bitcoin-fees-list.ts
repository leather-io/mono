import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  BtcFeeType,
  BitcoinTransactionFeeQuote,
  Money,
  TransactionFeeTier,
  btcTxTimeMap,
  transactionFeeTiers,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { getBitcoinTransactionFeesService } from '@leather.io/services';

import { formatCurrency } from '@app/common/currency-formatter';
import { useCurrentNativeSegwitBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useCryptoCurrencyMarketDataMeanAverage } from '@app/query/common/market-data/market-data.hooks';
import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

import { FeesListItem } from './bitcoin-fees-list';

interface UseBitcoinFeesListArgs {
  amount: Money;
  isSendingMax?: boolean;
  recipient: string;
}

function createRecipients({
  amount,
  recipient,
  isSendingMax,
  availableBalance,
}: {
  amount: Money;
  recipient: string;
  isSendingMax?: boolean;
  availableBalance: Money;
}) {
  return [
    {
      address: recipient,
      amount: isSendingMax ? availableBalance : amount,
    },
  ];
}

export function useBitcoinFeesList({ amount, isSendingMax, recipient }: UseBitcoinFeesListArgs) {
  const { btc: balance } = useCurrentNativeSegwitBtcBalanceWithFallback();
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const accountRequest = useNativeSegwitAccountRequest();
  const transactionFeesService = useMemo(() => getBitcoinTransactionFeesService(), []);

  const recipients = useMemo(
    () =>
      createRecipients({
        amount,
        recipient,
        isSendingMax,
        availableBalance: balance.availableBalance,
      }),
    [amount, balance.availableBalance, isSendingMax, recipient]
  );

  const transactionFeesQuery = useQuery({
    queryKey: [
      'bitcoin-transaction-fees',
      accountRequest.account.id.fingerprint,
      accountRequest.account.id.accountIndex,
      isSendingMax,
      recipients.map(({ address, amount }) => `${address}:${amount.amount.toString()}`),
    ],
    queryFn: ({ signal }) =>
      transactionFeesService.getBitcoinTransactionFees(
        accountRequest,
        recipients,
        isSendingMax,
        signal
      ),
    enabled: recipient.length > 0,
  });

  const feesList: FeesListItem[] = useMemo(() => {
    function getFiatFeeValue(fee: number) {
      return `~ ${formatCurrency(
        baseCurrencyAmountInQuote(createMoney(Math.ceil(fee), 'BTC'), btcMarketData)
      )}`;
    }

    const transactionFees = transactionFeesQuery.data;
    if (!transactionFees) return [];

    const tierMetadata: Record<TransactionFeeTier, { label: BtcFeeType; time: string }> = {
      high: { label: BtcFeeType.High, time: btcTxTimeMap.fastestFee },
      standard: { label: BtcFeeType.Standard, time: btcTxTimeMap.halfHourFee },
      low: { label: BtcFeeType.Low, time: btcTxTimeMap.hourFee },
    };

    return transactionFeeTiers
      .map(tier => {
        const feeQuote = transactionFees.options[tier] as BitcoinTransactionFeeQuote | undefined;
        if (!feeQuote) return null;
        const feeValue = feeQuote.value.amount.toNumber();
        return {
          label: tierMetadata[tier].label,
          value: feeValue,
          btcValue: formatCurrency(createMoney(feeValue, 'BTC'), { preset: 'pad-decimals' }),
          time: tierMetadata[tier].time,
          fiatValue: getFiatFeeValue(feeValue),
          feeRate: feeQuote.rate,
        };
      })
      .filter((fee): fee is FeesListItem => !!fee);
  }, [btcMarketData, transactionFeesQuery.data]);

  return {
    feesList,
    isLoading: transactionFeesQuery.isLoading,
  };
}
