import { memo } from 'react';

import { RecipientGuardSheet } from '@/features/send/components/recipient/recipient-guard-sheet';
import { RecipientQrScanner } from '@/features/send/components/recipient/recipient-qr-scanner';
import { RecipientQrSheet } from '@/features/send/components/recipient/recipient-qr-sheet';
import { RecipientSelector } from '@/features/send/components/recipient/recipient-selector/recipient-selector';
import { RecipientSelectorError } from '@/features/send/components/recipient/recipient-selector/recipient-selector-error';
import { RecipientSheet } from '@/features/send/components/recipient/recipient-sheet';
import { RecipientToggle } from '@/features/send/components/recipient/recipient-toggle';
import { useRecipientState } from '@/features/send/components/recipient/use-recipient-state';
import { matchRelevantActivityResult } from '@/features/send/components/recipient/use-relevant-activity';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { analytics } from '@/utils/analytics';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAssetInfo } from '@leather.io/models';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  assetInfo: FungibleCryptoAssetInfo;
  recipientSchema: ZodSchema;
}

export const Recipient = memo(({ value, onChange, assetInfo, recipientSchema }: RecipientProps) => {
  const {
    accounts,
    selectedAccount,
    relevantActivityResult,
    confirmAddressSelection,
    onSelectAddress,
    guardResult,
    guardSheetRef,
    sheetRef,
    openRecipientSheet,
    openScannerSheet,
    scannerSheetRef,
    closeScannerSheet,
    onQrScanned,
  } = useRecipientState({ assetInfo, recipientSchema, onChange });

  function onTogglePress() {
    analytics.track('send_recipient_sheet_opened');
    openRecipientSheet();
  }

  function onQrButtonPress(source: 'toggle' | 'input') {
    analytics.track('send_qr_scanner_opened', { source });
    openScannerSheet();
  }

  return (
    <>
      <RecipientToggle value={value} onPress={onTogglePress} onQrButtonPress={onQrButtonPress} />
      <RecipientSheet sheetRef={sheetRef}>
        {matchRelevantActivityResult({
          result: relevantActivityResult,
          loading: <SendFormLoadingSpinner />,
          error: () => <RecipientSelectorError />,
          success: data => (
            <RecipientSelector
              onQrButtonPress={onQrButtonPress}
              assetInfo={assetInfo}
              activity={data}
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAddress={onSelectAddress}
              recipientSchema={recipientSchema}
            />
          ),
        })}
      </RecipientSheet>
      <RecipientQrSheet sheetRef={scannerSheetRef}>
        <RecipientQrScanner onClose={closeScannerSheet} onScanned={onQrScanned} />
      </RecipientQrSheet>
      <RecipientGuardSheet
        sheetRef={guardSheetRef}
        config={guardResult}
        onConfirm={confirmAddressSelection}
      />
    </>
  );
});

Recipient.displayName = 'Recipient';
