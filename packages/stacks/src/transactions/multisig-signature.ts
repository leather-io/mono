import { StacksWireType, deserializeTransaction } from '@stacks/transactions';

// Reads the single signature a wallet contributed to a signed multisig Stacks
// transaction. Signing replaces the signer's slot in the spending condition with
// a MessageSignature (the 65-byte recoverable VRS signature, hex) in place of its
// public key. A freshly proposed payload carries no signatures, so exactly one is
// present after the current signer signs — theirs.
export function extractStxMultisigSignature(signedTxHex: string): string {
  const { spendingCondition } = deserializeTransaction(signedTxHex).auth;
  if (!('fields' in spendingCondition))
    throw new Error('Not a multisig transaction: spending condition has no auth fields');

  const signatures = spendingCondition.fields.flatMap(field =>
    field.contents.type === StacksWireType.MessageSignature ? [field.contents.data] : []
  );

  const [signature, ...rest] = signatures;
  if (signature === undefined || rest.length > 0)
    throw new Error(
      `Expected exactly one signature in the signed transaction, found ${signatures.length}`
    );
  return signature;
}
