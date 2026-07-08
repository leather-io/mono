import { assertUnreachable } from '@leather.io/utils';

import {
  type StacksUnsignedMultiSigTransactionOptions,
  type StacksUnsignedTransactionOptions,
  TransactionTypes,
} from './transaction.types';

// Proposals commit to a canonical nonce 0; the coordinator assigns the real
// nonce when promoting the proposal to pending before broadcast.
const placeholderNonce = 0;

function withoutPublicKey<T extends object>(options: T): Omit<T, 'publicKey'> {
  const result = { ...options };
  Reflect.deleteProperty(result, 'publicKey');
  return result;
}

// Converts single-sig unsigned-transaction options into the non-sequential
// multisig equivalent: drops the single-sig `publicKey`, adds the ordered
// `publicKeys` + `numSignatures`, and forces the placeholder nonce. The result
// flows through the same `generateStacksUnsignedTransaction` builder.
export function toUnsignedMultiSigStacksOptions(
  options: StacksUnsignedTransactionOptions,
  { publicKeys, numSignatures }: { publicKeys: string[]; numSignatures: number }
): StacksUnsignedMultiSigTransactionOptions {
  const multiSig = {
    publicKeys,
    numSignatures,
    useNonSequentialMultiSig: true,
    nonce: placeholderNonce,
  };
  switch (options.txType) {
    case TransactionTypes.StxTokenTransfer:
      return { ...withoutPublicKey(options), ...multiSig };
    case TransactionTypes.ContractCall:
      return { ...withoutPublicKey(options), ...multiSig };
    case TransactionTypes.ContractDeploy:
      return { ...withoutPublicKey(options), ...multiSig };
    default:
      return assertUnreachable(options);
  }
}
