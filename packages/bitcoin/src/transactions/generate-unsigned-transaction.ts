import { hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import {
  CoinSelectionRecipient,
  CoinSelectionUtxo,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '../coin-selection/coin-selection';
import { BtcSignerDefaultBip32Derivation } from '../signer/bitcoin-signer';
import { BtcSignerNetwork } from '../utils/bitcoin.network';
import { BitcoinError } from '../validation/bitcoin-error';

export interface GenerateBitcoinUnsignedTransactionArgs {
  feeRate: number;
  isSendingMax?: boolean;
  payerAddress: string;
  payerPublicKey: string;
  bip32Derivation: BtcSignerDefaultBip32Derivation[];
  network: BtcSignerNetwork;
  recipients: CoinSelectionRecipient[];
  utxos: CoinSelectionUtxo[];
}

export function generateBitcoinUnsignedTransactionNativeSegwit({
  feeRate,
  isSendingMax,
  payerAddress,
  payerPublicKey,
  bip32Derivation,
  network,
  recipients,
  utxos,
}: GenerateBitcoinUnsignedTransactionArgs) {
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
      bip32Derivation,
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
