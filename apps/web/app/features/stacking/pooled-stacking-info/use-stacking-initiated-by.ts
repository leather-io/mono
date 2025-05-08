import { ContractCallTransaction } from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';
import { useGetAccountExtendedBalancesQuery } from '~/features/stacking/hooks/stacking.query';
import { isSelfServicePool } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';

/**
 * Returns the address that initiated the current account's stacking. If the account isn't stacking,
 * returns `null`.
 */
export function useStackingInitiatedByQuery() {
  const { stacksAccount } = useLeatherConnect();
  //   // TODO: report error
  if (!stacksAccount?.address) throw new Error('No stacksAccount available');

  const stacksClient = useStacksClient();

  const q = useGetAccountExtendedBalancesQuery();

  // Typecast needed due to fields missing from types,
  // https://github.com/hirosystems/stacks.js/issues/1437

  const txId = (q.data?.stx as any)?.lock_tx_id as string | undefined;

  return useQuery({
    queryKey: ['stacker', txId, stacksAccount.address],
    queryFn: async () => {
      if (!txId) return { address: null } as const;

      const res = (await stacksClient.getTransactionById(
        // https://github.com/hirosystems/stacks-blockchain-api/tree/master/client#known-issues
        txId,
        new AbortController().signal
      )) as ContractCallTransaction;
      if (isStackingWithSelfServicePool(res)) {
        return { address: res.contract_call.contract_id };
      } else {
        return { address: res.sender_address };
      }
    },
    enabled: !q.isLoading,
  });
}

function isStackingWithSelfServicePool(t: ContractCallTransaction) {
  return isSelfServicePool(t.contract_call.contract_id);
}
