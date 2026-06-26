import { useMutation } from '@tanstack/react-query';

import type { AuthNetworkId, MultisigTransaction } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useInvalidateTransaction } from './use-transaction-mutations';
import { walletPropose } from './wallet-propose';

interface ProposeTransactionArgs {
  multisigAddress: string;
  rawPayload: string;
}

export function useProposeTransaction(network: AuthNetworkId) {
  const invalidate = useInvalidateTransaction(network);
  return useMutation<MultisigTransaction, Error, ProposeTransactionArgs>({
    mutationKey: ['multisig-propose-transaction', network],
    async mutationFn({ multisigAddress, rawPayload }) {
      const request = await walletPropose({ network, multisigAddress, rawPayload });
      return getMultisigService().proposeTransaction(request);
    },
    onSuccess: invalidate,
  });
}
