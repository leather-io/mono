import { serializeCV, stringAsciiCV } from '@stacks/transactions';
import { leather } from '~/utils/leather-sdk';

import type { AuthNetworkId } from '@leather.io/models';
import {
  type ProposeTransactionRequest,
  walletPropose as buildSharedProposeRequest,
} from '@leather.io/services';
import { buildStxProposalDomain } from '@leather.io/stacks';

interface WalletProposeParams {
  network: AuthNetworkId;
  multisigAddress: string;
  // BTC = PSBT base64; STX = raw-tx hex (placeholder nonce 0)
  rawPayload: string;
}

// Constructs the proposal hash, obtains the STX/BTC signature via the Leather
// SDK, and assembles the sig-as-auth propose request.
export async function walletPropose({
  network,
  multisigAddress,
  rawPayload,
}: WalletProposeParams): Promise<ProposeTransactionRequest> {
  return buildSharedProposeRequest({
    network,
    multisigAddress,
    rawPayload,
    signProposalCommitment,
  });
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
