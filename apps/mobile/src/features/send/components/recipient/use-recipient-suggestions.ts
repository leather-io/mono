import { buildRecipientSuggestions } from '@/features/send/components/recipient/build-recipient-suggestions';
import { type RecipientSection } from '@/features/send/components/recipient/recipient.types';
import {
  getLookupHelperByChain,
  recipientSchemaResultContainsError,
} from '@/features/send/components/recipient/recipient.utils';
import { useAccountHelpers } from '@/features/send/components/recipient/use-account-helpers';
import { useAccounts } from '@/store/accounts/accounts.read';
import {
  type QueryFunctionContext,
  type UseQueryResult,
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query';
import { type ZodSchema } from 'zod';

import {
  type AccountId,
  type FungibleCryptoAsset,
  type SendAssetActivity,
} from '@leather.io/models';
import { useDebouncedValue } from '@leather.io/ui/native';

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
        async validateAddress(value: string) {
          const result = await recipientSchema.safeParseAsync(value);
          return !recipientSchemaResultContainsError(result, 'invalidAddress');
        },
      }),
  });
}

interface MatchSuggestionsResultParams {
  query: UseQueryResult<RecipientSection[]>;
  pending: React.ReactElement;
  fetching?: React.ReactElement;
  error?(error: unknown): React.ReactElement;
  success(query: RecipientSection[]): React.ReactElement;
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
