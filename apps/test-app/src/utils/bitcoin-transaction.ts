import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import {
  BitcoinError,
  BtcSignerNetwork,
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '@leather.io/bitcoin';

export interface GenerateBtcTxArgs {
  feeRate: number;
  isSendingMax?: boolean;
  payerAddress: string;
  payerPublicKey: string;
  network: BtcSignerNetwork;
  recipients: CoinSelectionRecipient[];
  utxos: CoinSelectionUtxo[];
}

export function generateBtcTx({
  feeRate,
  isSendingMax,
  payerAddress,
  payerPublicKey,
  network,
  recipients,
  utxos,
}: GenerateBtcTxArgs) {
  const determineUtxosArgs = { feeRate, recipients, utxos };
  const { inputs, outputs, fee } = isSendingMax
    ? determineUtxosForSpendAll(determineUtxosArgs)
    : determineUtxosForSpend(determineUtxosArgs);

  if (!inputs.length) throw new BitcoinError('NoInputsToSign');
  if (!outputs.length) throw new BitcoinError('NoOutputsToSign');

  const tx = new btc.Transaction();
  const p2wpkh = btc.p2wpkh(hexToBytes(payerPublicKey), network);

  for (const input of inputs) {
    tx.addInput({
      txid: input.txid,
      index: input.vout,
      sequence: 0,

      witnessUtxo: {
        // script = 0014 + pubKeyHash
        script: p2wpkh.script,
        amount: BigInt(input.value),
      },
    });
  }

  outputs.forEach(output => {
    // When coin selection returns an output with no address,
    // we assume it is a change output
    if (!output.address) {
      tx.addOutputAddress(payerAddress, BigInt(output.value), network);
      return;
    }
    tx.addOutputAddress(output.address, BigInt(output.value), network);
  });

  return { tx, hex: tx.hex, psbt: tx.toPSBT(), inputs, fee };
}
