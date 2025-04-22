import { buildRecipientSuggestions } from '@/features/send/components/recipient/v2/build-recipient-suggestions';
import { RecipientSection } from '@/features/send/components/recipient/v2/types';
import { useAccountHelpers } from '@/features/send/components/recipient/v2/use-shameful-account-helpers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useBnsV2Client } from '@/queries/stacks/bns/bns-v2-client';
import { Account } from '@/store/accounts/accounts';
import { UseQueryResult, keepPreviousData, useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';

import { FungibleCryptoAssetInfo, SendAssetActivity } from '@leather.io/models';
import { fetchBtcNameOwner, fetchStacksNameOwner } from '@leather.io/query';

interface UseRecipientSuggestionsParams {
  searchTerm: string;
  activity: SendAssetActivity[];
  accounts: Account[];
  selectedAccount: Account;
  recipientSchema: ZodSchema;
  assetInfo: FungibleCryptoAssetInfo;
}

export function useRecipientSuggestions({
  searchTerm,
  activity,
  accounts,
  selectedAccount,
  assetInfo,
  recipientSchema,
}: UseRecipientSuggestionsParams) {
  const debounceDelay = searchTerm.length === 0 ? 0 : 500;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);
  const { getAddressByAccount, findAccountByAddress } = useAccountHelpers(accounts, assetInfo);
  const bnsV2Client = useBnsV2Client();
  const bnsLookupHelper = getLookupHelperByChain(assetInfo);

  return useQuery({
    queryKey: ['recipient-suggestions', debouncedSearchTerm],
    placeholderData: keepPreviousData,
    queryFn: async () =>
      buildRecipientSuggestions({
        searchTerm: debouncedSearchTerm,
        accounts,
        selectedAccount,
        activity,
        getAddressByAccount,
        findAccountByAddress,
        canSelfSend: assetInfo.chain === 'bitcoin',
        performBnsLookup: (name: string) => bnsLookupHelper(bnsV2Client, name),
        validateAddress: (value: string) =>
          recipientSchema.safeParseAsync(value).then(result => result.success),
      }),
  });
}

function getLookupHelperByChain(assetInfo: FungibleCryptoAssetInfo) {
  return {
    bitcoin: fetchBtcNameOwner,
    stacks: fetchStacksNameOwner,
  }[assetInfo.chain];
}

interface MatchSuggestionsResultParams {
  query: UseQueryResult<RecipientSection[], Error>;
  pending: React.ReactElement;
  fetching?: React.ReactElement;
  error?: (error: unknown) => React.ReactElement;
  success: (query: RecipientSection[]) => React.ReactElement;
}

export function matchSuggestionsResult({
  query,
  error,
  pending,
  fetching,
  success,
}: MatchSuggestionsResultParams) {
  if (query.isPending) {
    return pending;
  }

  if (query.isFetching && fetching) {
    return fetching;
  }

  if (query.isError && error) {
    return error(query.error);
  }

  if (query.isSuccess) {
    return success(query.data);
  }

  return null;
}
