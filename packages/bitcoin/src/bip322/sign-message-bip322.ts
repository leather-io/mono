import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import type { TransactionInputUpdate } from '@scure/btc-signer/psbt';

import { BitcoinAddress, BitcoinNetworkModes } from '@leather.io/models';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import {
  bip322TransactionToSignValues,
  encodeMessageWitnessData,
  hashBip322Message,
} from './bip322-utils';

const OP_RETURN_SCRIPT = btc.Script.encode([btc.OP.RETURN]);

interface CreateToSpendTxResult {
  decodedAddress: ReturnType<ReturnType<typeof btc.Address>['decode']>;
  script: Uint8Array;
  virtualToSpend: btc.Transaction;
}

export function createToSpendTx(
  address: BitcoinAddress,
  message: string,
  network: BitcoinNetworkModes
): CreateToSpendTxResult {
  const { prevoutHash, prevoutIndex, sequence } = bip322TransactionToSignValues;
  const networkConfig = getBtcSignerLibNetworkConfigByMode(network);

  const addressCodec = btc.Address(networkConfig);
  const decodedAddress = addressCodec.decode(address);
  const script = btc.OutScript.encode(decodedAddress);

  const messageHash = hashBip322Message(message);
  const witnessCommands = [btc.OP.OP_0, messageHash];
  const witnessScript = btc.Script.encode(witnessCommands);

  const virtualToSpend = new btc.Transaction({
    version: 0,
    lockTime: 0,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
    disableScriptCheck: true,
    allowLegacyWitnessUtxo: true,
  });

  virtualToSpend.addInput({
    txid: prevoutHash,
    index: prevoutIndex,
    sequence,
    witnessScript,
  });

  virtualToSpend.addOutput({
    script,
    amount: 0n,
  });

  return { decodedAddress, script, virtualToSpend };
}

function createToSignTx(
  toSpend: btc.Transaction,
  script: Uint8Array,
  decodedAddress: CreateToSpendTxResult['decodedAddress']
) {
  const virtualToSign = new btc.Transaction({
    version: 0,
    lockTime: 0,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
    disableScriptCheck: true,
    allowLegacyWitnessUtxo: true,
  });

  const input: TransactionInputUpdate = {
    txid: toSpend.id,
    index: 0,
    sequence: 0,
    witnessUtxo: {
      script,
      amount: 0n,
    },
  };

  if (decodedAddress.type === 'tr' && decodedAddress.pubkey) {
    input.tapInternalKey = decodedAddress.pubkey;
  }

  virtualToSign.addInput(input);

  virtualToSign.addOutput({
    amount: 0n,
    script: OP_RETURN_SCRIPT,
  });

  return virtualToSign;
}

export interface SignBip322MessageSimpleArgs {
  address: BitcoinAddress;
  message: string;
  network: BitcoinNetworkModes;
  signPsbt(psbt: btc.Transaction): Promise<btc.Transaction>;
}
export async function signBip322MessageSimple({
  address,
  message,
  network,
  signPsbt,
}: SignBip322MessageSimpleArgs) {
  const { virtualToSpend, script, decodedAddress } = createToSpendTx(address, message, network);
  const virtualToSign = createToSignTx(virtualToSpend, script, decodedAddress);

  const signedTx = await signPsbt(virtualToSign);

  const input = signedTx.getInput(0);
  if (!input.finalScriptWitness || !input.finalScriptWitness.length) {
    signedTx.finalizeIdx(0);
  }

  const finalizedInput = signedTx.getInput(0);

  if (!finalizedInput.finalScriptWitness || !finalizedInput.finalScriptWitness.length) {
    throw new Error('Unable to finalize BIP-322 signature');
  }

  const witnessBuffers = finalizedInput.finalScriptWitness.map(part => Buffer.from(part));
  const unencodedSig = encodeMessageWitnessData(witnessBuffers);
  const signature = base64.encode(unencodedSig);

  return {
    virtualToSpend,
    virtualToSign: signedTx,
    unencodedSig,
    signature,
  };
}
