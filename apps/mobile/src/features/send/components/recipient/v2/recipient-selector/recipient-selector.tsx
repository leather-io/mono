import { useState } from 'react';

import { RecipientInput } from '@/features/send/components/recipient/v2/recipient-input';
import { RecipientSelectorItem } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-item';
import { RecipientSelectorSectionHeader } from '@/features/send/components/recipient/v2/recipient-selector/recipient-selector-section-header';
import {
  type RecipientSection,
  type RecipientSuggestions,
} from '@/features/send/components/recipient/v2/types';
import { useRecipientSuggestions } from '@/features/send/components/recipient/v2/use-recipient-suggestions';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { type Account } from '@/store/accounts/accounts';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { entries, map, pickBy, pipe } from 'remeda';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAssetInfo, type SendAssetActivity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

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

  const showLoadingIndicator = searchTerm.length > 0 && recipientSuggestions.isFetching;

  return (
    <>
      <Box px="5" py="5" pb="4">
        <RecipientInput value={searchTerm} onChange={setSearchTerm} />
      </Box>
      {showLoadingIndicator && <SendFormLoadingSpinner />}
      {!showLoadingIndicator && recipientSuggestions.isSuccess && (
        <BottomSheetSectionList
          sections={suggestionsToSections(recipientSuggestions.data)}
          keyboardShouldPersistTaps="always"
          keyExtractor={item => item.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <RecipientSelectorSectionHeader title={section.title} />
          )}
          renderItem={({ item }) => (
            <RecipientSelectorItem entry={item} onSelect={onSelectAddress} />
          )}
        />
      )}
    </>
  );
}

function suggestionsToSections(data: RecipientSuggestions): RecipientSection[] {
  return pipe(
    data,
    pickBy(suggestionEntries => suggestionEntries.length > 0),
    entries(),
    map(entryType => ({
      title: getSectionTitle(entryType[0]),
      data: entryType[1],
    }))
  );
}

function getSectionTitle(name: 'recents' | 'accounts' | 'matching') {
  return {
    recents: t({
      id: 'send-form.recipient.recents',
      message: 'Recents',
    }),
    accounts: t({
      id: 'send-form.recipient.accounts',
      message: 'Your accounts',
    }),
    matching: t({
      id: 'send-form.recipient.matching',
      message: 'Matching',
    }),
  }[name];
}
