import { useCallback } from 'react';

import { useBitcoinPayerFromKeyOrigin } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useNetworkPreferenceBitcoinScureLibNetworkConfig } from '@/store/settings/settings.read';

import { CoinSelectionRecipient, generateBitcoinUnsignedTransaction } from '@leather.io/bitcoin';
import { Money, OwnedUtxo } from '@leather.io/models';

interface BtcTransactionValues {
  amount: Money;
  recipients: CoinSelectionRecipient[];
}

interface GenerateBtcUnsignedTransactionCallbackArgs {
  feeRate: number;
  isSendingMax: boolean;
  utxos: OwnedUtxo[];
  values: BtcTransactionValues;
}

interface UseGenerateBtcUnsignedTransactionNativeSegwit {
  changeAddress: string;
  fingerprint: string;
}
export function useGenerateBtcUnsignedTransactionNativeSegwit(
  args: UseGenerateBtcUnsignedTransactionNativeSegwit
) {
  const network = useNetworkPreferenceBitcoinScureLibNetworkConfig();
  const payerLookup = useBitcoinPayerFromKeyOrigin();

  return useCallback(
    ({ feeRate, isSendingMax, values, utxos }: GenerateBtcUnsignedTransactionCallbackArgs) =>
      generateBitcoinUnsignedTransaction({
        feeRate,
        isSendingMax,
        network,
        recipients: values.recipients,
        utxos,
        payerLookup,
        changeAddress: args.changeAddress,
      }),
    [args.changeAddress, network, payerLookup]
  );
}
