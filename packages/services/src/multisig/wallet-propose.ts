import { computeProposalHash, decodeProposalPayload } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';

import type { ProposeTransactionRequest } from './multisig.service';

// Signs the proposal commitment hash with the proposer's key. Injected by the
// caller so this stays platform-agnostic: the web app signs through the Leather
// SDK; the extension signs in-process with the parent singlesig key.
export type SignProposalCommitment = (
  network: AuthNetworkId,
  proposalHash: string
) => Promise<string>;

export interface WalletProposeArgs {
  network: AuthNetworkId;
  multisigAddress: string;
  // BTC = PSBT base64; STX = raw-tx hex (placeholder nonce 0)
  rawPayload: string;
  signProposalCommitment: SignProposalCommitment;
}

// Constructs the proposal hash, obtains the chain-appropriate commitment
// signature via the injected signer, and assembles the sig-as-auth propose
// request for getMultisigService().proposeTransaction().
export async function walletPropose({
  network,
  multisigAddress,
  rawPayload,
  signProposalCommitment,
}: WalletProposeArgs): Promise<ProposeTransactionRequest> {
  const chain = network.startsWith('btc') ? 'btc' : 'stx';
  const proposalTimestamp = Math.floor(Date.now() / 1000);
  const proposalHash = computeProposalHash({
    multisigAddress,
    rawPayload: decodeProposalPayload(chain, rawPayload),
    proposalTimestamp,
  });
  const proposalSignature = await signProposalCommitment(network, proposalHash);
  return { multisigAddress, rawPayload, proposalSignature, proposalTimestamp };
}
