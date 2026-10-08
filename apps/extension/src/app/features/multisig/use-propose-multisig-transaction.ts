import { useMutation } from '@tanstack/react-query';

import type { AuthNetworkId } from '@leather.io/models';
import {
  type ProposeMultisigTransactionArgs,
  createProposeMultisigTransactionMutationConfig,
} from '@leather.io/queries';

import { MULTISIG_API_URL } from '@shared/environment';

import { useSignProposalCommitment } from './use-sign-proposal-commitment';

class SigningDismissedError extends Error {}

export function useProposeMultisigTransaction() {
  const signProposalCommitment = useSignProposalCommitment();
  const mutation = useMutation(
    createProposeMultisigTransactionMutationConfig({
      baseUrl: MULTISIG_API_URL || undefined,
      async signProposalCommitment(network: AuthNetworkId, proposalHash: string) {
        const signature = await signProposalCommitment(network, proposalHash);
        if (signature === null) throw new SigningDismissedError();
        return signature;
      },
    })
  );

  async function proposeMultisigTransaction(args: ProposeMultisigTransactionArgs) {
    try {
      return await mutation.mutateAsync(args);
    } catch (error) {
      if (!(error instanceof SigningDismissedError)) throw error;
      mutation.reset();
      return null;
    }
  }

  return {
    proposeMultisigTransaction,
    isProposing: mutation.isPending,
  };
}
