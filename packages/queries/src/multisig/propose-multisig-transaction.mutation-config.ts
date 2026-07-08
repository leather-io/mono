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
  signProposalCommitment: SignProposalCommitment;
}

export function createProposeMultisigTransactionMutationConfig({
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
      return getMultisigService().proposeTransaction(request);
    },
  } satisfies UseMutationOptions<MultisigTransaction, Error, ProposeMultisigTransactionArgs>;
}
