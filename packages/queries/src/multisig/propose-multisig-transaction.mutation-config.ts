import type { UseMutationOptions } from '@tanstack/react-query';

import type { MultisigTransaction } from '@leather.io/models';
import {
  type SignProposalCommitment,
  type WalletProposeArgs,
  getMultisigService,
  walletPropose,
} from '@leather.io/services';

export type ProposeMultisigTransactionArgs = Omit<WalletProposeArgs, 'signProposalCommitment'>;

interface CreateProposeMultisigTransactionMutationConfigArgs {
  baseUrl?: string;
  signProposalCommitment: SignProposalCommitment;
}

export function createProposeMultisigTransactionMutationConfig({
  baseUrl,
  signProposalCommitment,
}: CreateProposeMultisigTransactionMutationConfigArgs) {
  return {
    mutationKey: ['multisig-propose-transaction'],
    async mutationFn({ network, multisigAddress, rawPayload }: ProposeMultisigTransactionArgs) {
      const request = await walletPropose({
        network,
        multisigAddress,
        rawPayload,
        signProposalCommitment,
      });
      return getMultisigService().proposeTransaction(request, undefined, baseUrl);
    },
  } satisfies UseMutationOptions<MultisigTransaction, Error, ProposeMultisigTransactionArgs>;
}
