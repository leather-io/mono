import {
  AddressHashMode,
  StacksTransactionWire,
  StacksWireType,
  estimateTransactionByteLength,
  serializePayload,
} from '@stacks/transactions';

const messageSignatureWireByteLength = 66;
const publicKeyWireByteLength = 34;

const nonSequentialMultiSigHashModes = [
  AddressHashMode.P2SHNonSequential,
  AddressHashMode.P2WSHNonSequential,
];

export function getEstimatedUnsignedStacksTxByteLength(transaction: StacksTransactionWire) {
  return transaction.serializeBytes().byteLength;
}

export function getSerializedUnsignedStacksTxPayload(transaction: StacksTransactionWire) {
  return serializePayload(transaction.payload);
}

export function estimateStacksTransactionByteLength(
  transaction: StacksTransactionWire,
  signerCount?: number
): number {
  const baseByteLength = estimateTransactionByteLength(transaction);
  const { spendingCondition } = transaction.auth;
  if (!nonSequentialMultiSigHashModes.includes(spendingCondition.hashMode)) {
    return baseByteLength;
  }
  if (!('fields' in spendingCondition) || !('signaturesRequired' in spendingCondition)) {
    return baseByteLength;
  }
  const existingSignatureCount = spendingCondition.fields.filter(
    field => field.contents.type === StacksWireType.MessageSignature
  ).length;
  const { signaturesRequired } = spendingCondition;
  const missingSignatureCount = Math.max(0, signaturesRequired - existingSignatureCount);
  const totalSigners = signerCount ?? spendingCondition.fields.length;
  const remainingPublicKeyCount = Math.max(0, totalSigners - signaturesRequired);
  return (
    baseByteLength +
    missingSignatureCount * messageSignatureWireByteLength +
    remainingPublicKeyCount * publicKeyWireByteLength
  );
}
