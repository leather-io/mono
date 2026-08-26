import { useMutation } from '@tanstack/react-query';

import { LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { createProposeMultisigTransactionMutationConfig } from '@leather.io/queries';

import { MULTISIG_API_URL } from '@shared/environment';

import { useSignProposalCommitment } from './use-sign-proposal-commitment';

export function useProposeMultisigTransaction() {
  const signProposalCommitment = useSignProposalCommitment();
  const mutation = useMutation(
    createProposeMultisigTransactionMutationConfig({
      baseUrl: MULTISIG_API_URL || LEATHER_API_URL_STAGING,
      signProposalCommitment,
    })
  );

  return {
    proposeMultisigTransaction: mutation.mutateAsync,
    isProposing: mutation.isPending,
  };
}
