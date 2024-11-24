import { AverageBitcoinFeeRates, Money } from '@leather.io/models';

import {
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  DetermineUtxosForSpendArgs,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '../coin-selection/coin-selection';

type GetBitcoinTransactionFeeArgs = DetermineUtxosForSpendArgs & {
  isSendingMax?: boolean;
};

export function getBitcoinTransactionFee({ isSendingMax, ...props }: GetBitcoinTransactionFeeArgs) {
  try {
    const { fee } = isSendingMax
      ? determineUtxosForSpendAll({ ...props })
      : determineUtxosForSpend({ ...props });
    return fee;
  } catch (error) {
    return null;
  }
}

export interface BitcoinFees {
  blockchain: 'bitcoin';
  high: { fee: Money | null; feeRate: number };
  standard: { fee: Money | null; feeRate: number };
  low: { fee: Money | null; feeRate: number };
}

export interface GetBitcoinFeesArgs {
  feeRates: AverageBitcoinFeeRates;
  isSendingMax?: boolean;
  recipients: CoinSelectionRecipient[];
  utxos: CoinSelectionUtxo[];
}
export function getBitcoinFees({ feeRates, isSendingMax, recipients, utxos }: GetBitcoinFeesArgs) {
  const defaultArgs = {
    isSendingMax,
    recipients,
    utxos,
  };

  const highFeeRate = feeRates.fastestFee.toNumber();
  const standardFeeRate = feeRates.halfHourFee.toNumber();
  const lowFeeRate = feeRates.hourFee.toNumber();

  const highFeeValue = getBitcoinTransactionFee({
    ...defaultArgs,
    feeRate: highFeeRate,
  });
  const standardFeeValue = getBitcoinTransactionFee({
    ...defaultArgs,
    feeRate: standardFeeRate,
  });
  const lowFeeValue = getBitcoinTransactionFee({
    ...defaultArgs,
    feeRate: lowFeeRate,
  });

  return {
    high: { feeRate: highFeeRate, fee: highFeeValue },
    standard: { feeRate: standardFeeRate, fee: standardFeeValue },
    low: { feeRate: lowFeeRate, fee: lowFeeValue },
  };
}
