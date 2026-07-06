import { useMutation } from '@tanstack/react-query';

import type { AuthNetworkId, MultisigTransaction } from '@leather.io/models';
import { getMultisigService, walletPropose } from '@leather.io/services';

import { useSignProposalCommitment } from './use-sign-proposal-commitment';

interface ProposeMultisigTransactionArgs {
  network: AuthNetworkId;
  multisigAddress: string;
  // BTC = PSBT base64; STX = raw-tx hex (placeholder nonce 0)
  rawPayload: string;
}

// Builds + signs the proposal commitment with the parent key and submits it to the
// multisig coordinator. Mirrors the web useProposeTransaction mutation, but injects
// the extension's in-process signer instead of the Leather SDK.
export function useProposeMultisigTransaction() {
  const signProposalCommitment = useSignProposalCommitment();
  return useMutation<MultisigTransaction, Error, ProposeMultisigTransactionArgs>({
    mutationKey: ['multisig-propose-transaction'],
    async mutationFn({ network, multisigAddress, rawPayload }) {
      const request = await walletPropose({
        network,
        multisigAddress,
        rawPayload,
        signProposalCommitment,
      });
      return getMultisigService().proposeTransaction(request);
    },
  });
}
