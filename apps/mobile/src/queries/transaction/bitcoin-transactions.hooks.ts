import { useCallback } from 'react';

import { useNetworkPreferenceBitcoinScureLibNetworkConfig } from '@/store/settings/settings.read';

import {
  BtcSignerDefaultBip32Derivation,
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
  bip32Derivation: BtcSignerDefaultBip32Derivation[];
}

export function useGenerateBtcUnsignedTransactionNativeSegwit(address: string, publicKey: string) {
  const network = useNetworkPreferenceBitcoinScureLibNetworkConfig();

  return useCallback(
    ({
      feeRate,
      isSendingMax,
      values,
      utxos,
      bip32Derivation,
    }: GenerateBtcUnsignedTransactionCallbackArgs) =>
      generateBitcoinUnsignedTransactionNativeSegwit({
        feeRate,
        isSendingMax,
        network,
        bip32Derivation,
        payerAddress: address,
        payerPublicKey: publicKey,
        recipients: values.recipients,
        utxos,
      }),
    [address, network, publicKey]
  );
}
