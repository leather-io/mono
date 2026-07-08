import { leather } from '~/utils/leather-sdk';

import type { MultisigTransaction, VaultAccount } from '@leather.io/models';

import { resolveWalletRpcNetwork } from '../../network/resolve-wallet-rpc-network';
import { extractStxMultisigSignature } from './extract-stx-multisig-signature';
import { preSignVerification } from './pre-sign-verification';
import { substituteStxNonce } from './substitute-stx-nonce';

export async function signStxTransaction(
  transaction: MultisigTransaction,
  account: VaultAccount
): Promise<{ signature: string; inputIndex?: number }[]> {
  preSignVerification({ transaction, account });
  if (transaction.nonce === null)
    throw new Error('Transaction has no assigned nonce yet; it must be promoted to pending first');
  const signingHex = substituteStxNonce({
    rawPayload: transaction.proposalRawPayload,
    nonce: transaction.nonce,
  });
  const { txHex } = await leather.stxSignTransaction({
    txHex: signingHex,
    network: resolveWalletRpcNetwork(transaction.network),
  });
  return [{ signature: extractStxMultisigSignature(txHex) }];
}
