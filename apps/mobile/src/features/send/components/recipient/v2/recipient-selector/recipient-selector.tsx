import { useState } from 'react';

import { RecipientInput } from '@/features/send/components/recipient/v2/recipient-input';
import { RecipientSelectorHeader } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-header';
import { RecipientSelectorItem } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-item';
import { RecipientSelectorSearchEmptyState } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-search-empty-state';
import { RecipientSelectorSectionHeader } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-section-header';
import {
  isBnsLookupCandidate,
  normalizeSearchTerm,
} from '@/features/send/components/recipient/v2/recipient.utils';
import {
  matchSuggestionsResult,
  useRecipientSuggestions,
} from '@/features/send/components/recipient/v2/use-recipient-suggestions';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { type Account } from '@/store/accounts/accounts';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAssetInfo, type SendAssetActivity } from '@leather.io/models';

interface RecipientSelectorProps {
  onSelectAddress(address: string): void;
  activity: SendAssetActivity[];
  accounts: Account[];
  selectedAccount: Account;
  recipientSchema: ZodSchema;
  assetInfo: FungibleCryptoAssetInfo;
}

export function RecipientSelector({
  activity,
  accounts,
  selectedAccount,
  recipientSchema,
  assetInfo,
  onSelectAddress,
}: RecipientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const recipientSuggestions = useRecipientSuggestions({
    searchTerm,
    recipientSchema,
    activity,
    accounts,
    selectedAccount,
    assetInfo,
  });
  const isPerformingSearch = normalizeSearchTerm(searchTerm).length > 0;
  const isBnsLookup = isBnsLookupCandidate(normalizeSearchTerm(searchTerm));

  return (
    <>
      <RecipientSelectorHeader>
        <RecipientInput value={searchTerm} onChange={setSearchTerm} />
      </RecipientSelectorHeader>
      {matchSuggestionsResult({
        query: recipientSuggestions,
        pending: <SendFormLoadingSpinner />,
        // Avoid brief flickers by only showing a spinner when BNS lookup is in flight
        fetching: isBnsLookup ? <SendFormLoadingSpinner /> : undefined,
        error: () => <RecipientSelectorSearchEmptyState />,
        success: sections => {
          if (isPerformingSearch && sections.length === 0) {
            return <RecipientSelectorSearchEmptyState />;
          }

          return (
            <BottomSheetSectionList
              sections={sections}
              keyboardShouldPersistTaps="always"
              keyExtractor={item => item.id}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section }) => (
                <RecipientSelectorSectionHeader id={section.id} />
              )}
              renderItem={({ item }) => (
                <RecipientSelectorItem entry={item} onSelect={onSelectAddress} />
              )}
            />
          );
        },
      })}
    </>
  );
}
