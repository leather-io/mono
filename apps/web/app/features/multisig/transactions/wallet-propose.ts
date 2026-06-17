import { serializeCV, stringAsciiCV } from '@stacks/transactions';
import { leather } from '~/utils/leather-sdk';

import { computeProposalHash, decodeProposalPayload } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';
import type { ProposeTransactionRequest } from '@leather.io/services';

import { buildStxProposalDomain } from './stx-proposal-domain';

interface WalletProposeParams {
  network: AuthNetworkId;
  multisigAddress: string;
  // BTC = PSBT base64; STX = raw-tx hex (placeholder nonce 0)
  rawPayload: string;
}

// Constructs the proposal hash, obtains the STX/BTC signature,
// and assembles the sig-as-auth propose request.
export async function walletPropose({
  network,
  multisigAddress,
  rawPayload,
}: WalletProposeParams): Promise<ProposeTransactionRequest> {
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

async function signProposalCommitment(
  network: AuthNetworkId,
  proposalHash: string
): Promise<string> {
  if (network.startsWith('btc')) {
    const signed = await leather.signMessage({ message: proposalHash, paymentType: 'p2wpkh' });
    return signed.signature;
  }
  const signed = await leather.stxSignMessage({
    messageType: 'structured',
    domain: serializeCV(buildStxProposalDomain(network)),
    message: serializeCV(stringAsciiCV(proposalHash)),
  });
  return signed.signature;
}
