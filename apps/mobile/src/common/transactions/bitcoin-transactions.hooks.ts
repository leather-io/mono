import { useCallback } from 'react';

import { useNetworkPreferenceBitcoinScureLibNetworkConfig } from '@/store/settings/settings.read';

import {
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  generateBitcoinUnsignedTransactionNativeSegwit,
} from '@leather.io/bitcoin';
import { Money } from '@leather.io/models';

interface BtcTransactionValues {
  amount: Money;
  recipients: CoinSelectionRecipient[];
}

interface GenerateBtcUnsignedTransactionCallbackArgs {
  feeRate: number;
  isSendingMax: boolean;
  utxos: CoinSelectionUtxo[];
  values: BtcTransactionValues;
}

export function useGenerateBtcUnsignedTransactionNativeSegwit(address: string, publicKey: string) {
  const network = useNetworkPreferenceBitcoinScureLibNetworkConfig();

  return useCallback(
    ({ feeRate, isSendingMax, values, utxos }: GenerateBtcUnsignedTransactionCallbackArgs) =>
      generateBitcoinUnsignedTransactionNativeSegwit({
        feeRate,
        isSendingMax,
        network,
        payerAddress: address,
        payerPublicKey: publicKey,
        recipients: values.recipients,
        utxos,
      }),
    [address, network, publicKey]
  );
}
