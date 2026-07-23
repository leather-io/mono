import { BitcoinError } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinTransactionFees } from '@app/query/bitcoin/fees/bitcoin-transaction-fees.hooks';

import type { Fee, Fees, FeesErrorReason } from '../fee-editor.context';
import { getBitcoinFee, getBitcoinSendMaxFee } from './bitcoin-fees.utils';
import { useBitcoinFees } from './use-bitcoin-fees';

interface BitcoinFees {
  fees: Fees;
  feesError?: FeesErrorReason;
  isLoading: boolean;
  getCustomFee(rate: number): Fee;
}

function createEmptyFee(priority: Fee['priority']): Fee {
  return { priority, feeRate: 0, txFee: createMoney(0, 'BTC'), time: '' };
}

const emptyFees: Fees = {
  slow: createEmptyFee('slow'),
  standard: createEmptyFee('standard'),
  fast: createEmptyFee('fast'),
  custom: createEmptyFee('custom'),
};

interface BitcoinFeesLoaderProps {
  account: AccountRequest;
  children({ fees, feesError, isLoading, getCustomFee }: BitcoinFees): React.ReactNode;
  isSendingMax?: boolean;
  loadingFallback: React.ReactNode;
  recipients: TransferRecipient[];
  utxos: OwnedUtxo[];
}
export function BitcoinFeesLoader({
  account,
  children,
  isSendingMax,
  loadingFallback,
  recipients,
  utxos,
}: BitcoinFeesLoaderProps) {
  const {
    data: feeRates,
    isLoading,
    error,
  } = useBitcoinTransactionFees({
    account,
    recipients,
    isMaxSpend: isSendingMax,
  });
  const fees = useBitcoinFees({ feeRates });

  function getCustomFee(feeRate: number): Fee {
    const determineUtxosForFeeArgs = {
      recipients,
      utxos,
      feeRate,
    };
    const fee = isSendingMax
      ? getBitcoinSendMaxFee(determineUtxosForFeeArgs)
      : getBitcoinFee(determineUtxosForFeeArgs);

    return {
      priority: 'custom',
      feeRate,
      txFee: fee ?? createMoney(0, 'BTC'),
      time: '',
    };
  }
  if (error instanceof BitcoinError && error.message === 'InsufficientFunds') {
    return children({
      fees: fees ?? emptyFees,
      feesError: 'insufficient-funds',
      isLoading: false,
      getCustomFee,
    });
  }

  if (fees) return children({ fees, isLoading, getCustomFee });
  if (error) {
    return children({
      fees: emptyFees,
      feesError: 'fee-estimation-failed',
      isLoading: false,
      getCustomFee,
    });
  }
  return loadingFallback;
}
