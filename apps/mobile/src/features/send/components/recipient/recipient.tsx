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
import { Account } from '@/store/accounts/accounts';
import { analytics } from '@/utils/analytics';
import { type ZodSchema } from 'zod';

import { type FungibleCryptoAsset } from '@leather.io/models';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  asset: FungibleCryptoAsset;
  recipientSchema: ZodSchema;
  currentAccount: Account;
}

export const Recipient = memo(
  ({ value, onChange, asset, recipientSchema, currentAccount }: RecipientProps) => {
    const {
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
    } = useRecipientState({ asset, recipientSchema, onChange, currentAccount });

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
                asset={asset}
                activity={data}
                onSelectAddress={onSelectAddress}
                recipientSchema={recipientSchema}
                currentAccount={currentAccount}
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
  }
);

Recipient.displayName = 'Recipient';
