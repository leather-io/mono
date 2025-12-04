import { useState } from 'react';
import { SectionListRenderItemInfo } from 'react-native';

import { SearchInput } from '@/components/search-input';
import { useSendPasteButton } from '@/features/feature-flags';
import { IosRecipientPasteButton } from '@/features/send/components/recipient/ios-recipient-paste-button';
import { RecipientSelectorHeader } from '@/features/send/components/recipient/recipient-selector/recipient-selector-header';
import { RecipientSelectorItem } from '@/features/send/components/recipient/recipient-selector/recipient-selector-item';
import { RecipientSelectorSearchEmptyState } from '@/features/send/components/recipient/recipient-selector/recipient-selector-search-empty-state';
import { RecipientSelectorSectionHeader } from '@/features/send/components/recipient/recipient-selector/recipient-selector-section-header';
import {
  RecipientSection,
  RecipientSuggestionEntry,
} from '@/features/send/components/recipient/recipient.types';
import {
  isBnsLookupCandidate,
  normalizeSearchTerm,
} from '@/features/send/components/recipient/recipient.utils';
import {
  matchSuggestionsResult,
  useRecipientSuggestions,
} from '@/features/send/components/recipient/use-recipient-suggestions';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { t } from '@lingui/core/macro';
import { type ZodSchema } from 'zod';

import { AccountId, type FungibleCryptoAsset, type SendAssetActivity } from '@leather.io/models';
import { Box, IconButton, QrCodeIcon, Sheet } from '@leather.io/ui/native';

interface RecipientSelectorProps {
  activity: SendAssetActivity[];
  recipientSchema: ZodSchema;
  asset: FungibleCryptoAsset;
  onSelectAddress(address: string): void;
  onQrButtonPress(source: 'toggle' | 'input'): void;
  currentAccount: AccountId;
}

export function RecipientSelector({
  activity,
  recipientSchema,
  asset,
  onSelectAddress,
  onQrButtonPress,
  currentAccount,
}: RecipientSelectorProps) {
  const pasteButtonEnabled = useSendPasteButton();
  const [searchTerm, setSearchTerm] = useState('');
  const recipientSuggestions = useRecipientSuggestions({
    searchTerm,
    recipientSchema,
    activity,
    asset,
    currentAccount,
  });
  const isPerformingSearch = normalizeSearchTerm(searchTerm).length > 0;
  const isBnsLookup = isBnsLookupCandidate(normalizeSearchTerm(searchTerm));

  function handlePasteButtonPress(value: string) {
    setSearchTerm(value);
  }

  return (
    <>
      <RecipientSelectorHeader>
        <Box>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            autoFocus
            placeholder={t`Search for BNS name or address`}
            TextInputComponent={Sheet.TextInput}
          />
          {searchTerm.length === 0 && (
            <Box position="absolute" top={12} right={8} flexDirection="row">
              {pasteButtonEnabled && <IosRecipientPasteButton onPress={handlePasteButtonPress} />}
              <IconButton
                label={t`Scan a QR code`}
                onPress={() => onQrButtonPress('input')}
                icon={<QrCodeIcon />}
              />
            </Box>
          )}
        </Box>
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
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item: RecipientSuggestionEntry) => item.id}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section }: { section: RecipientSection }) => (
                <RecipientSelectorSectionHeader id={section.id} />
              )}
              renderItem={({
                item,
              }: SectionListRenderItemInfo<RecipientSuggestionEntry, RecipientSection>) => (
                <RecipientSelectorItem entry={item} onSelect={onSelectAddress} asset={asset} />
              )}
            />
          );
        },
      })}
    </>
  );
}
