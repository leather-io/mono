import { useState } from 'react';

import { useSendPasteButton } from '@/features/feature-flags';
import { IosRecipientPasteButton } from '@/features/send/components/recipient/ios-recipient-paste-button';
import { RecipientInput } from '@/features/send/components/recipient/recipient-input';
import { RecipientSelectorHeader } from '@/features/send/components/recipient/recipient-selector/recipient-selector-header';
import { RecipientSelectorItem } from '@/features/send/components/recipient/recipient-selector/recipient-selector-item';
import { RecipientSelectorSearchEmptyState } from '@/features/send/components/recipient/recipient-selector/recipient-selector-search-empty-state';
import { RecipientSelectorSectionHeader } from '@/features/send/components/recipient/recipient-selector/recipient-selector-section-header';
import {
  isBnsLookupCandidate,
  normalizeSearchTerm,
} from '@/features/send/components/recipient/recipient.utils';
import {
  matchSuggestionsResult,
  useRecipientSuggestions,
} from '@/features/send/components/recipient/use-recipient-suggestions';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { type Account } from '@/store/accounts/accounts';
import { BottomSheetSectionList } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAsset, type SendAssetActivity } from '@leather.io/models';
import { Box, IconButton, QrCodeIcon } from '@leather.io/ui/native';

interface RecipientSelectorProps {
  activity: SendAssetActivity[];
  accounts: Account[];
  selectedAccount: Account;
  recipientSchema: ZodSchema;
  asset: FungibleCryptoAsset;
  onSelectAddress(address: string): void;
  onQrButtonPress(source: 'toggle' | 'input'): void;
}

export function RecipientSelector({
  activity,
  accounts,
  selectedAccount,
  recipientSchema,
  asset,
  onSelectAddress,
  onQrButtonPress,
}: RecipientSelectorProps) {
  const pasteButtonEnabled = useSendPasteButton();
  const [searchTerm, setSearchTerm] = useState('');
  const recipientSuggestions = useRecipientSuggestions({
    searchTerm,
    recipientSchema,
    activity,
    accounts,
    selectedAccount,
    asset,
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
          <RecipientInput value={searchTerm} onChange={setSearchTerm} />
          {searchTerm.length === 0 && (
            <Box position="absolute" top={12} right={8} flexDirection="row">
              {pasteButtonEnabled && <IosRecipientPasteButton onPress={handlePasteButtonPress} />}
              <IconButton
                label={t({
                  id: 'send-form.recipient.qr_button',
                  message: 'Scan a QR code',
                })}
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
              keyExtractor={item => item.id}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section }) => (
                <RecipientSelectorSectionHeader id={section.id} />
              )}
              renderItem={({ item }) => (
                <RecipientSelectorItem entry={item} onSelect={onSelectAddress} asset={asset} />
              )}
            />
          );
        },
      })}
    </>
  );
}
