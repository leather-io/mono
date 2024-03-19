import { Money, UtxoItem } from '@leather-wallet/models';
import * as btc from '@scure/btc-signer';

import { BtcSignerNetwork, Signer } from '../..';
import {
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from './coinselect/local-coin-selection';

interface GenerateNativeSegwitSingleRecipientTxValues {
  amount: Money;
  recipient: string;
}
export async function generateUnsignedNativeSegwitSingleRecipientTx({
  networkMode,
  nativeSegwitSigner,
  values,
  feeRate,
  utxos,
  isSendingMax,
}: {
  networkMode: BtcSignerNetwork;
  nativeSegwitSigner: Signer<btc.P2Ret>;
  values: GenerateNativeSegwitSingleRecipientTxValues;
  feeRate: number;
  utxos: UtxoItem[];
  isSendingMax?: boolean;
}) {
  if (!utxos.length) return;
  if (!feeRate) return;

  try {
    const tx = new btc.Transaction();

    const amountAsNumber = values.amount.amount.toNumber();

    const determineUtxosArgs = {
      amount: amountAsNumber,
      feeRate,
      recipient: values.recipient,
      utxos,
    };

    const { inputs, outputs, fee } = isSendingMax
      ? determineUtxosForSpendAll(determineUtxosArgs)
      : determineUtxosForSpend(determineUtxosArgs);

    // logger.info('Coin selection', { inputs, outputs, fee });

    if (!inputs.length) throw new Error('No inputs to sign');
    if (!outputs.length) throw new Error('No outputs to sign');

    if (outputs.length > 2) throw new Error('Address reuse mode: wallet should have max 2 outputs');

    const p2wpkh = btc.p2wpkh(nativeSegwitSigner.publicKey, networkMode);

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
      // When coin selection returns output with no address we assume it is
      // a change output
      if (!output.address) {
        tx.addOutputAddress(nativeSegwitSigner.address, BigInt(output.value), networkMode);
        return;
      }
      tx.addOutputAddress(values.recipient, BigInt(output.value), networkMode);
    });

    return { hex: tx.hex, fee, psbt: tx.toPSBT(), inputs };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error signing bitcoin transaction', e);
    return null;
  }
}
