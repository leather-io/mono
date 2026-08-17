import type { AuthNetworkId, MultisigTransaction } from '@leather.io/models';

export function makeMockBondProposal(
  network: AuthNetworkId,
  rawPayload: string
): MultisigTransaction {
  const now = new Date().toISOString();
  return {
    id: `dev-proposal-${Date.now()}`,
    vaultAccountId: 'dev-vault-account',
    network,
    proposerUserId: 'dev-user',
    proposalRawPayload: rawPayload,
    proposalSignature: '',
    proposalTimestamp: Math.floor(Date.now() / 1000),
    proposalHash: '',
    nonce: null,
    txId: null,
    status: 'pending',
    signatures: [],
    broadcastAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
