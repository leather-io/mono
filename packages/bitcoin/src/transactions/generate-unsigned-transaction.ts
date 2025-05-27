import * as btc from '@scure/btc-signer';

import {
  CoinSelectionRecipient,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '../coin-selection/coin-selection';
import {
  BitcoinNativeSegwitPayer,
  BitcoinTaprootPayer,
  payerToBip32Derivation,
  payerToTapBip32Derivation,
} from '../signer/bitcoin-signer';
import { BtcSignerNetwork } from '../utils/bitcoin.network';
import { BitcoinError } from '../validation/bitcoin-error';

export interface GenerateBitcoinUnsignedTransactionArgs<T> {
  feeRate: number;
  isSendingMax?: boolean;
  network: BtcSignerNetwork;
  recipients: CoinSelectionRecipient[];
  utxos: T[];
  changeAddress: string;
  payerLookup(keyOrigin: string): BitcoinNativeSegwitPayer | BitcoinTaprootPayer | undefined;
}
export function generateBitcoinUnsignedTransaction<
  T extends { txid: string; vout: number; value: number; keyOrigin: string },
>({
  feeRate,
  isSendingMax,
  network,
  recipients,
  changeAddress,
  utxos,
  payerLookup,
}: GenerateBitcoinUnsignedTransactionArgs<T>) {
  const determineUtxosArgs = { feeRate, recipients, utxos };
  const { inputs, outputs, fee } = isSendingMax
    ? determineUtxosForSpendAll(determineUtxosArgs)
    : determineUtxosForSpend(determineUtxosArgs);

  if (!inputs.length) throw new BitcoinError('NoInputsToSign');
  if (!outputs.length) throw new BitcoinError('NoOutputsToSign');

  const tx = new btc.Transaction();

  for (const input of inputs) {
    const payer = payerLookup(input.keyOrigin);

    if (!payer) {
      // eslint-disable-next-line no-console
      console.log(`No payer found for input with keyOrigin ${input.keyOrigin}`);
      continue;
    }

    const bip32Derivation =
      payer.paymentType === 'p2tr'
        ? { tapBip32Derivation: [payerToTapBip32Derivation(payer)] }
        : { bip32Derivation: [payerToBip32Derivation(payer)] };

    const tapInternalKey =
      payer.paymentType === 'p2tr' ? { tapInternalKey: payer.payment.tapInternalKey } : {};

    tx.addInput({
      txid: input.txid,
      index: input.vout,
      witnessUtxo: {
        script: payer.payment.script,
        amount: BigInt(input.value),
      },
      ...bip32Derivation,
      ...tapInternalKey,
    });
  }

  outputs.forEach(output => {
    // When coin selection returns an output with no address,
    // we assume it is a change output
    if (!output.address) {
      tx.addOutputAddress(changeAddress, BigInt(output.value), network);
      return;
    }
    tx.addOutputAddress(output.address, BigInt(output.value), network);
  });

  return { tx, hex: tx.hex, psbt: tx.toPSBT(), inputs, fee };
}
