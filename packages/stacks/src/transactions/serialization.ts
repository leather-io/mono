import { StacksTransactionWire, serializePayload } from '@stacks/transactions';

export function getEstimatedUnsignedStacksTxByteLength(transaction: StacksTransactionWire) {
  return transaction.serializeBytes().byteLength;
}

export function getSerializedUnsignedStacksTxPayload(transaction: StacksTransactionWire) {
  return serializePayload(transaction.payload);
}
