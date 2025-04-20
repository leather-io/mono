import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Account } from '@/store/accounts/accounts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';

import { FungibleCryptoAssetInfo, SendAssetActivity } from '@leather.io/models';

interface UseRecipientSuggestionsParams {
  searchTerm: string;
  activity: SendAssetActivity[];
  accounts: Account[];
  selectedAccount: Account;
  recipientSchema: ZodSchema;
  assetInfo: FungibleCryptoAssetInfo;
}

export function useRecipientSuggestions({ searchTerm }: UseRecipientSuggestionsParams) {
  const debounceDelay = searchTerm.length === 0 ? 0 : 500;
  const debouncedSearchTerm = useDebouncedValue(searchTerm, debounceDelay);

  return useQuery({
    queryKey: ['recipient-suggestions', debouncedSearchTerm],
    placeholderData: keepPreviousData,
    queryFn: () => {
      return {
        recents: [],
        accounts: [],
      };
    },
  });
}
