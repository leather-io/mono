import { BitcoinError } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinTransactionFees } from '@app/query/bitcoin/fees/bitcoin-transaction-fees.hooks';

import type { Fee, Fees } from '../fee-editor.context';
import { getBitcoinFee, getBitcoinSendMaxFee } from './bitcoin-fees.utils';
import { useBitcoinFees } from './use-bitcoin-fees';

interface BitcoinFees {
  fees: Fees;
  isLoading: boolean;
  getCustomFee(rate: number): Fee;
}

interface BitcoinFeesLoaderProps {
  account: AccountRequest;
  children({ fees, isLoading, getCustomFee }: BitcoinFees): React.ReactNode;
  isSendingMax?: boolean;
  recipients: TransferRecipient[];
  utxos: OwnedUtxo[];
}
export function BitcoinFeesLoader({
  account,
  children,
  isSendingMax,
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
    throw error;
  }

  if (!fees) return null;
  return children({ fees, isLoading, getCustomFee });
}
