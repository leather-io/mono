import { leather } from '~/utils/leather-sdk';

import type { MultisigTransaction, VaultAccount } from '@leather.io/models';
import { extractStxMultisigSignature, substituteStxNonce } from '@leather.io/stacks';

import { preSignVerification } from './pre-sign-verification';

// Signs a proposed STX multisig transaction with the extension. Pre-signing
// verification runs first, as part of the ceremony; then we swap the placeholder
// nonce for the backend-assigned one, sign the whole transaction, and return the
// single contributed signature.
export async function signStxTransaction(
  transaction: MultisigTransaction,
  account: VaultAccount
): Promise<{ signature: string; inputIndex?: number }[]> {
  preSignVerification({ transaction, account });
  if (transaction.nonce === null)
    throw new Error('Transaction has no assigned nonce yet; it must be promoted to pending first');
  const signingHex = substituteStxNonce(transaction.proposalRawPayload, transaction.nonce);
  const { txHex } = await leather.stxSignTransaction({ txHex: signingHex });
  return [{ signature: extractStxMultisigSignature(txHex) }];
}
