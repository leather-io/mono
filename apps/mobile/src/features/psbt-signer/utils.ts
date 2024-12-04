import { TransactionInput, TransactionOutput } from '@scure/btc-signer/psbt';

import {
  extractRequiredKeyOrigins,
  getPsbtAsTransaction,
  getPsbtTxInputs,
  getPsbtTxOutputs,
} from '@leather.io/bitcoin';
import { decomposeDescriptor } from '@leather.io/crypto';
import { isDefined } from '@leather.io/utils';

export type PsbtApproverState = 'start' | 'submitting' | 'submitted';

function getPsbtDerivationPath(input: TransactionInput | TransactionOutput) {
  const inputDescriptor = extractRequiredKeyOrigins(
    input.bip32Derivation ?? input.tapBip32Derivation ?? []
  )[0];
  if (inputDescriptor) {
    return decomposeDescriptor(inputDescriptor);
  }
  return undefined;
}

export function getPsbtInputDerivationPaths({ psbtHex }: { psbtHex: string }) {
  const tx = getPsbtAsTransaction(psbtHex);
  const inputs = getPsbtTxInputs(tx);
  const inputDescriptor = inputs.map(getPsbtDerivationPath).filter(isDefined);

  return inputDescriptor;
}

export function getPsbtOutputDerivationPaths({ psbtHex }: { psbtHex: string }) {
  const tx = getPsbtAsTransaction(psbtHex);
  const outputs = getPsbtTxOutputs(tx);
  const outputDescriptor = outputs.map(getPsbtDerivationPath).filter(isDefined);

  return outputDescriptor;
}
