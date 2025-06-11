import { buildRecipientSuggestions } from '@/features/send/components/recipient/build-recipient-suggestions';
import { RecipientSection } from '@/features/send/components/recipient/recipient.types';
import {
  getLookupHelperByChain,
  recipientSchemaResultContainsError,
} from '@/features/send/components/recipient/recipient.utils';
import { useAccountHelpers } from '@/features/send/components/recipient/use-shameful-account-helpers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useBnsV2Client } from '@/queries/stacks/bns/bns-v2-client';
import { Account } from '@/store/accounts/accounts';
import { UseQueryResult, keepPreviousData, useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';

import { FungibleCryptoAsset, SendAssetActivity } from '@leather.io/models';

interface UseRecipientSuggestionsParams {
  searchTerm: string;
  activity: SendAssetActivity[];
  accounts: Account[];
  selectedAccount: Account;
  recipientSchema: ZodSchema;
  asset: FungibleCryptoAsset;
}

export function useRecipientSuggestions({
  searchTerm,
  activity,
  accounts,
  selectedAccount,
  asset,
  recipientSchema,
}: UseRecipientSuggestionsParams) {
  const debounceDelay = searchTerm.length === 0 ? 0 : 500;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);
  const { getAddressByAccount, findAccountByAddress } = useAccountHelpers(accounts, asset);
  const bnsV2Client = useBnsV2Client();
  const bnsLookupHelper = getLookupHelperByChain(asset);

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
        canSelfSend: asset.chain === 'bitcoin',
        performBnsLookup: (name: string) => bnsLookupHelper(bnsV2Client, name.toLowerCase()),
        validateAddress: (value: string) =>
          recipientSchema
            .safeParseAsync(value)
            .then(result => !recipientSchemaResultContainsError(result, 'invalidAddress')),
      }),
  });
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
