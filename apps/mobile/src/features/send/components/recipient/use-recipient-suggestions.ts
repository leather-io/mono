import { buildRecipientSuggestions } from '@/features/send/components/recipient/build-recipient-suggestions';
import { RecipientSection } from '@/features/send/components/recipient/recipient.types';
import {
  getLookupHelperByChain,
  recipientSchemaResultContainsError,
} from '@/features/send/components/recipient/recipient.utils';
import { useAccountHelpers } from '@/features/send/components/recipient/use-account-helpers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useAccounts } from '@/store/accounts/accounts.read';
import {
  QueryFunctionContext,
  UseQueryResult,
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { ZodSchema } from 'zod';

import { AccountId, FungibleCryptoAsset, SendAssetActivity } from '@leather.io/models';

interface UseRecipientSuggestionsParams {
  searchTerm: string;
  activity: SendAssetActivity[];
  recipientSchema: ZodSchema;
  asset: FungibleCryptoAsset;
  currentAccount: AccountId;
}

export function useRecipientSuggestions({
  searchTerm,
  activity,
  asset,
  recipientSchema,
  currentAccount,
}: UseRecipientSuggestionsParams) {
  const debounceDelay = searchTerm.length === 0 ? 0 : 500;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);
  const { getAddressByAccount, findAccountByAddress } = useAccountHelpers(asset);
  const bnsLookupHelper = getLookupHelperByChain(asset);
  const { list: accounts } = useAccounts();

  return useQuery({
    queryKey: ['recipient-suggestions', debouncedSearchTerm],
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }: QueryFunctionContext) =>
      buildRecipientSuggestions({
        searchTerm: debouncedSearchTerm,
        accounts,
        currentAccount,
        activity,
        getAddressByAccount,
        findAccountByAddress,
        canSelfSend: asset.chain === 'bitcoin',
        performBnsLookup: (name: string) => bnsLookupHelper(name.toLowerCase(), signal),
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
