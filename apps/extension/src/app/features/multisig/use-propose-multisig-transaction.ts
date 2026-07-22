import { useMutation } from '@tanstack/react-query';

import { LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { createProposeMultisigTransactionMutationConfig } from '@leather.io/queries';

import { useSignProposalCommitment } from './use-sign-proposal-commitment';

export function useProposeMultisigTransaction() {
  const signProposalCommitment = useSignProposalCommitment();
  const mutation = useMutation(
    createProposeMultisigTransactionMutationConfig({
      baseUrl: LEATHER_API_URL_STAGING,
      signProposalCommitment,
    })
  );

  return {
    proposeMultisigTransaction: mutation.mutateAsync,
    isProposing: mutation.isPending,
  };
}
