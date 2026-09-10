import { useMemo } from 'react';

import type { OwnedUtxo } from '@leather.io/models';
import { getInputSizing } from '@leather.io/services';

import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinFeeRates } from '@app/query/bitcoin/fees/bitcoin-fee-rates.hooks';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useActiveWalletType } from '@app/store/common/wallet-type.selectors';

import {
  type LedgerBitcoinInputLimit,
  emptyLedgerBitcoinInputLimit,
  getLedgerBitcoinInputLimit,
} from '../utils/ledger-bitcoin-input-limit';

interface LedgerBitcoinInputLimitArgs {
  utxos: OwnedUtxo[];
  recipients: TransferRecipient[];
  feeRate?: number;
  isSendingMax?: boolean;
}

interface CachedLedgerBitcoinInputLimit {
  key: string;
  utxos: OwnedUtxo[];
  result: LedgerBitcoinInputLimit;
}

function makeCacheKey({ recipients, feeRate, isSendingMax }: LedgerBitcoinInputLimitArgs) {
  const recipientsKey = recipients
    .map(recipient => `${recipient.address}:${recipient.amount.amount.toString()}`)
    .join('|');
  return `${recipientsKey}|${feeRate ?? ''}|${isSendingMax ? 'max' : 'amount'}`;
}

export function useLedgerBitcoinInputLimit() {
  const isLedger = useActiveWalletType() === 'ledger';
  const { data: feeRates } = useBitcoinFeeRates();
  const account = useCurrentAccountAddresses();
  const defaultFeeRate = feeRates?.standard.rate;

  return useMemo(() => {
    let cached: CachedLedgerBitcoinInputLimit | null = null;

    return {
      isLedger,
      getLedgerBitcoinInputLimit(args: LedgerBitcoinInputLimitArgs): LedgerBitcoinInputLimit {
        if (!isLedger) return emptyLedgerBitcoinInputLimit;

        const feeRate = args.feeRate ?? defaultFeeRate;
        const key = makeCacheKey({ ...args, feeRate });
        if (cached && cached.key === key && cached.utxos === args.utxos) return cached.result;

        const result = getLedgerBitcoinInputLimit({
          utxos: args.utxos,
          recipients: args.recipients,
          feeRate,
          isSendingMax: args.isSendingMax,
          inputSizing: getInputSizing(account),
        });
        cached = { key, utxos: args.utxos, result };
        return result;
      },
    };
  }, [isLedger, defaultFeeRate, account]);
}
