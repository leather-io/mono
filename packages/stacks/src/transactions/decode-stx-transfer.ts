import { PayloadType, cvToString, deserializeTransaction } from '@stacks/transactions';

export interface StxTransferDetails {
  recipient: string;
  amount: bigint;
  fee: bigint;
}

// Reads the recipient, amount, and fee out of a serialized unsigned (or signed)
// STX token-transfer transaction. Returns null for any non-token-transfer
// payload. Used to display a proposed multisig transfer before it is broadcast,
// when the only record of its details is the serialized payload itself.
export function decodeStxTransferPayload(rawTx: string): StxTransferDetails | null {
  const tx = deserializeTransaction(rawTx);
  if (tx.payload.payloadType !== PayloadType.TokenTransfer) return null;
  return {
    recipient: cvToString(tx.payload.recipient),
    amount: tx.payload.amount,
    fee: tx.auth.spendingCondition.fee,
  };
}
