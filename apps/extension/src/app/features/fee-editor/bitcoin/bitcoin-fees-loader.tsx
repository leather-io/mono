import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { BitcoinTransactionFeeQuote, Money, btcTxTimeMap } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getBitcoinTransactionFeesService } from '@leather.io/services';

import type { TransferRecipient } from '@shared/models/form.model';

import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

import type { Fee, Fees } from '../fee-editor.context';

interface BitcoinFees {
  fees: Fees;
  isLoading: boolean;
  getCustomFee(rate: number): Fee;
}

interface BitcoinFeesLoaderProps {
  amount: Money;
  children({ fees, isLoading, getCustomFee }: BitcoinFees): React.ReactNode;
  isSendingMax?: boolean;
  recipients: TransferRecipient[];
}

function createFeeFromQuote(
  quote: BitcoinTransactionFeeQuote,
  priority: Fee['priority'],
  time: string
): Fee {
  return {
    priority,
    feeRate: quote.rate,
    feeValue: quote.value.amount.toNumber(),
    txFee: quote.value,
    time,
  };
}

export function BitcoinFeesLoader({
  amount,
  children,
  isSendingMax,
  recipients,
}: BitcoinFeesLoaderProps) {
  const accountRequest = useNativeSegwitAccountRequest();
  const transactionFeesService = useMemo(() => getBitcoinTransactionFeesService(), []);

  const transactionFeesQuery = useQuery({
    queryKey: [
      'bitcoin-transaction-fee-editor',
      accountRequest.account.id.fingerprint,
      accountRequest.account.id.accountIndex,
      isSendingMax,
      recipients.map(({ address, amount }) => `${address}:${amount.amount.toString()}`),
      amount.amount.toString(),
    ],
    queryFn: ({ signal }) =>
      transactionFeesService.getBitcoinTransactionFees(
        accountRequest,
        recipients,
        isSendingMax,
        signal
      ),
    enabled: recipients.length > 0,
  });

  const defaultFee: Fee = {
    priority: 'custom',
    feeRate: 0,
    feeValue: 0,
    txFee: createMoney(0, 'BTC'),
    time: '',
  };

  const fees = useMemo<Fees | undefined>(() => {
    const transactionFees = transactionFeesQuery.data;
    if (!transactionFees) return;

    const quoteByTier: Partial<Record<TransactionFeeTier, BitcoinTransactionFeeQuote>> = {
      high: transactionFees.options.high as BitcoinTransactionFeeQuote,
      standard: transactionFees.options.standard as BitcoinTransactionFeeQuote,
      low: transactionFees.options.low as BitcoinTransactionFeeQuote,
    };

    const slowFee =
      quoteByTier.low && createFeeFromQuote(quoteByTier.low, 'slow', btcTxTimeMap.hourFee);
    const standardFee =
      quoteByTier.standard &&
      createFeeFromQuote(quoteByTier.standard, 'standard', btcTxTimeMap.halfHourFee);
    const fastFee =
      quoteByTier.high && createFeeFromQuote(quoteByTier.high, 'fast', btcTxTimeMap.fastestFee);

    const fallbackFee = slowFee ?? standardFee ?? fastFee ?? defaultFee;

    return {
      slow: slowFee ?? fallbackFee,
      standard: standardFee ?? fallbackFee,
      fast: fastFee ?? fallbackFee,
      custom: standardFee ?? fallbackFee,
    };
  }, [transactionFeesQuery.data]);

  const estimatedTxSize =
    (transactionFeesQuery.data?.options.standard as BitcoinTransactionFeeQuote | undefined)
      ?.estimatedTxSize ??
    (transactionFeesQuery.data?.options.high as BitcoinTransactionFeeQuote | undefined)
      ?.estimatedTxSize ??
    (transactionFeesQuery.data?.options.low as BitcoinTransactionFeeQuote | undefined)
      ?.estimatedTxSize ??
    0;

  function getCustomFee(feeRate: number): Fee {
    const feeValue = estimatedTxSize ? Math.ceil(estimatedTxSize * feeRate) : 0;
    return {
      priority: 'custom',
      feeRate,
      feeValue,
      txFee: createMoney(feeValue, 'BTC'),
      time: '',
    };
  }

  if (!fees) return null;
  return children({ fees, isLoading: transactionFeesQuery.isLoading, getCustomFee });
}
